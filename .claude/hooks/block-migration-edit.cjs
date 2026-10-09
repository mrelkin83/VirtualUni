#!/usr/bin/env node
// PreToolUse hook (Edit|Write): refuse hand-edits to already-generated Prisma
// migrations. Migrations must come from `prisma migrate dev`/`migrate deploy`.
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

  const normalized = filePath.replace(/\\/g, '/');
  const isMigration = /(^|\/)backend\/prisma\/migrations\//.test(normalized);

  if (isMigration) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'Las migraciones de Prisma no se editan a mano - usa `prisma migrate dev` (o `prisma migrate deploy` con SQL escrito a mano en un archivo NUEVO) para generar una nueva migracion.',
      },
    }));
  }
  process.exit(0);
});
