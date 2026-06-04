#!/usr/bin/env bash
# PostToolUse hook: kök js/<dosya>.js düzenlendiğinde en/ aynasını güncellemeyi hatırlatır.
# Asıl mantık check-i18n-sync.js içinde (node, projeyle aynı runtime). Engellemez.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$DIR/check-i18n-sync.js"
