#!/usr/bin/env node
// PostToolUse hook (Edit|Write): after a .ts/.tsx edit, run `tsc --noEmit`
// against whichever of the two tsconfigs (root = frontend, backend/) the
// edited file lives under, and feed any errors back as additionalContext.
// Non-blocking: this never fails the tool call, only reports.
const { execSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CACHE_DIR = path.join(ROOT, '.claude', 'hooks', '.cache');

let raw = '';
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const input = JSON.parse(raw || '{}');
    filePath = (input.tool_input && input.tool_input.file_path) || '';
  } catch {
    process.exit(0);
  }

  if (!/\.tsx?$/.test(filePath)) process.exit(0);

  const absPath = path.resolve(filePath);
  const relPath = path.relative(ROOT, absPath);
  if (relPath.startsWith('..')) process.exit(0);

  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.includes('node_modules/') || normalized.includes('/dist/') || normalized.startsWith('dist/')) {
    process.exit(0);
  }

  const isBackend = normalized.startsWith('backend/');
  const cwd = isBackend ? path.join(ROOT, 'backend') : ROOT;
  const label = isBackend ? 'backend' : 'frontend';
  const buildInfo = path.join(CACHE_DIR, `${label}.tsbuildinfo`);

  let output = '';
  let failed = false;
  try {
    execSync(
      `npx tsc -p . --noEmit --incremental --tsBuildInfoFile "${buildInfo}"`,
      { cwd, timeout: 90000, maxBuffer: 10 * 1024 * 1024, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
  } catch (err) {
    failed = true;
    output = `${err.stdout || ''}${err.stderr || ''}`.trim();
  }

  if (failed && output) {
    const truncated = output.length > 3000 ? `${output.slice(0, 3000)}\n... (truncado)` : output;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `tsc --noEmit (${label}) encontro errores tras editar ${normalized}:\n\n${truncated}`,
      },
    }));
  }
  process.exit(0);
});
