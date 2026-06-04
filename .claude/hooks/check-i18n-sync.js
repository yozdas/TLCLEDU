#!/usr/bin/env node
// PostToolUse hook mantığı: kök js/<dosya>.js düzenlenince en/ aynasını hatırlat.
// stdin'den hook JSON'unu okur; engellemez (exit 0), yalnız ek bağlam enjekte eder.
let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let fp = '';
  try { fp = (JSON.parse(raw).tool_input || {}).file_path || ''; } catch (_) {}
  const m = fp.match(/(?:^|\/)js\/([A-Za-z0-9_.-]+\.js)$/);
  const isRoot = m && !fp.includes('/en/js/') && !fp.includes('/tests/');
  if (isRoot) {
    const base = m[1];
    const msg =
      `i18n hatirlatma: Kokte 'js/${base}' duzenlendi. Mantik degistiyse 'en/js/${base}' ` +
      `aynasini da guncelle (gorunur metinleri Ingilizce cevir). ` +
      `Bkz. .claude/rules/i18n-sync.md veya skill 'sync-i18n'.`;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: msg },
    }));
  }
  process.exit(0);
});
