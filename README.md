# mcp-jsdelivr

JSDelivr Data API MCP

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `npm_package_stats` | Request counts + bandwidth for an npm package served via JSDelivr. |
| `gh_repo_stats` | JSDelivr stats for files served from a GitHub repo (e.g. branch/tag URLs). |
| `top_npm_packages` | JSDelivr leaderboard of top-served npm packages. |
| `list_npm_files` | List files (and their sizes/types) inside a published npm version. |
| `resolve_version` | Resolve a semver range or tag to a concrete published version. |
| `list_npm_versions` | All published versions for an npm package. |

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

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
