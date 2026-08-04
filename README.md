# @pipeworx/jsdelivr

JSDelivr Data API MCP — CDN package stats, file listing, version resolution for npm + GitHub. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `npm_package_stats(package_name, period?)` — request counts + bandwidth for an npm package
- `gh_repo_stats(owner, repo, period?)` — request counts for a GitHub repo via JSDelivr
- `top_npm_packages(period?, by?, limit?)` — leaderboard
- `list_npm_files(package_name, version?)` — files in a published version
- `resolve_version(package_name, range?)` — resolve a semver range to a concrete version
- `list_npm_versions(package_name)` — all published versions

## Data source

`https://data.jsdelivr.com/v1/` — keyless, generous rate limits.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Jsdelivr data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
