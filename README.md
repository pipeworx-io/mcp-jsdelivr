# @pipeworx/jsdelivr

JSDelivr Data API MCP — CDN package stats, file listing, version resolution for npm + GitHub. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1856+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Tools

- `npm_package_stats(package_name, period?)` — request counts + bandwidth for an npm package
- `gh_repo_stats(owner, repo, period?)` — request counts for a GitHub repo via JSDelivr
- `top_npm_packages(period?, by?, limit?)` — leaderboard
- `list_npm_files(package_name, version?)` — files in a published version
- `resolve_version(package_name, range?)` — resolve a semver range to a concrete version
- `list_npm_versions(package_name)` — all published versions

## Data source

`https://data.jsdelivr.com/v1/` — keyless, generous rate limits.

## Scoped package names (`@scope/name`) — the encoding gotcha

A scoped name is **one path segment** to jsDelivr, so the `/` inside it has to be
escaped along with the `@`. Measured 2026-09-16 (fleet #2104) against every
endpoint family this pack uses:

| form sent | `/packages/npm/<pkg>` | `<pkg>/resolved` | `<pkg>@<version>` | `/stats/packages/npm/<pkg>` |
|---|---|---|---|---|
| raw `@angular/core` | 200 | 200 | 200 | 200 |
| fully escaped `%40angular%2Fcore` | 200 | 200 | 200 | 200 |
| half escaped `%40angular/core` | **400** | **400** | **400** | **400** |

The families do **not** disagree — they all accept raw and all accept fully
escaped. The pack used to split the name on `/` and encode each half, emitting
the half-escaped form, which is the one shape none of them take. `encodePkg` now
runs `encodeURIComponent` over the whole name; that is also the form jsDelivr
puts in the `links.self` of its own responses, and it leaves unscoped names
(`lodash`, `react`) byte-identical.

Separately, the file-tree endpoint wants a **concrete** version — `<pkg>@latest`
404s — so `list_npm_files` resolves `latest` through `/resolved` first (#2070).

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "jsdelivr": {
      "url": "https://gateway.pipeworx.io/jsdelivr/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/jsdelivr/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1856+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/npm_package_stats \
  -H 'Content-Type: application/json' \
  -d '{"package_name":"react"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/npm_package_stats`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-jsdelivr` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/jsdelivr/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "jsdelivr": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-jsdelivr"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Jsdelivr data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
