interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * JSDelivr Data API MCP
 *
 * Auth: none.
 * Docs: https://github.com/jsdelivr/data.jsdelivr.com
 */


const BASE = 'https://data.jsdelivr.com/v1';

const tools: McpToolExport['tools'] = [
  {
    name: 'npm_package_stats',
    description: 'Request counts + bandwidth for an npm package served via JSDelivr.',
    inputSchema: {
      type: 'object',
      properties: {
        package_name: { type: 'string', description: 'npm package name (scoped allowed)' },
        period: {
          type: 'string',
          description: 'day | week | month | quarter | year | s-month | s-quarter | s-year (default month)',
        },
      },
      required: ['package_name'],
    },
  },
  {
    name: 'gh_repo_stats',
    description: 'Return JSDelivr CDN request count and bandwidth for files served from a GitHub owner/repo for the specified period (day/week/month/quarter/year).',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        period: { type: 'string' },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'top_npm_packages',
    description: 'JSDelivr leaderboard of top-served npm packages.',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string' },
        by: { type: 'string', description: 'hits (default) | bandwidth' },
        limit: { type: 'number', description: '1-100 (default 25)' },
      },
    },
  },
  {
    name: 'list_npm_files',
    description: 'List files (and their sizes/types) inside a published npm version.',
    inputSchema: {
      type: 'object',
      properties: {
        package_name: { type: 'string' },
        version: { type: 'string', description: 'Specific version (default latest)' },
      },
      required: ['package_name'],
    },
  },
  {
    name: 'resolve_version',
    description: 'Resolve a semver range or tag to a concrete published version.',
    inputSchema: {
      type: 'object',
      properties: {
        package_name: { type: 'string' },
        range: { type: 'string', description: 'Semver range (default "latest")' },
      },
      required: ['package_name'],
    },
  },
  {
    name: 'list_npm_versions',
    description: 'All published versions for an npm package.',
    inputSchema: {
      type: 'object',
      properties: { package_name: { type: 'string' } },
      required: ['package_name'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'npm_package_stats': {
      const pkg = encodePkg(reqStr(args, 'package_name', '"react"'));
      const period = String(args.period ?? 'month');
      return jdGet(`/stats/packages/npm/${pkg}?period=${encodeURIComponent(period)}`);
    }
    case 'gh_repo_stats': {
      const owner = reqStr(args, 'owner', '"vercel"');
      const repo = reqStr(args, 'repo', '"next.js"');
      const period = String(args.period ?? 'month');
      return jdGet(`/stats/packages/gh/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?period=${encodeURIComponent(period)}`);
    }
    case 'top_npm_packages': {
      const params = new URLSearchParams({
        period: String(args.period ?? 'month'),
        by: String(args.by ?? 'hits'),
        limit: String(Math.min(100, Math.max(1, (args.limit as number) ?? 25))),
        type: 'npm',
      });
      return jdGet(`/stats/packages?${params}`);
    }
    case 'list_npm_files': {
      const pkg = encodePkg(reqStr(args, 'package_name', '"react"'));
      const version = (args.version as string | undefined)?.trim() || 'latest';
      return jdGet(`/packages/npm/${pkg}@${encodeURIComponent(version)}`);
    }
    case 'resolve_version': {
      const pkg = encodePkg(reqStr(args, 'package_name', '"react"'));
      const range = String(args.range ?? 'latest');
      return jdGet(`/packages/npm/${pkg}/resolved?specifier=${encodeURIComponent(range)}`);
    }
    case 'list_npm_versions': {
      const pkg = encodePkg(reqStr(args, 'package_name', '"react"'));
      return jdGet(`/packages/npm/${pkg}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function encodePkg(pkg: string): string {
  // Scoped packages have a slash; JSDelivr expects them URL-encoded.
  return pkg.split('/').map((s) => encodeURIComponent(s)).join('/');
}

async function jdGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'pipeworx-mcp-jsdelivr/1.0 (+https://pipeworx.io)',
    },
  });
  if (res.status === 404) throw new Error('JSDelivr: not found');
  if (res.status === 429) throw new Error('JSDelivr: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`JSDelivr error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
