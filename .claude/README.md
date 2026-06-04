# `.claude/` — TLCL Eğitim AI Altyapısı

Bu klasör, projenin **AI iş birliği altyapısıdır**. Amaç: Claude (ve Gemini/Jules) her seferinde
"hangi kod nerede?" diye arayıp token harcamasın; kurallar, iş akışları ve proje hafızası tek
yerde toplansın.

## Yapı
```
CLAUDE.md            # Claude girişi (hafıza + kuralları @import eder)
GEMINI.md            # Gemini CLI girişi (aynı paylaşılan dosyaları @import eder)
AGENTS.md            # Jules / Codex / Cursor girişi (kendi içinde özet + işaretçiler)
.claude/
├─ settings.json     # hook'lar + izin allowlist'i (prompt azaltır)
├─ memory/           # PROJE HAFIZASI (tüm ajanlar paylaşır)
│  ├─ architecture.md     # KOD HARİTASI — hangi kod nerede
│  ├─ book-reference.md   # referans kitap: assets/TLCL-25.12.pdf
│  └─ glossary.md         # konvansiyonlar, terimler, tuzaklar
├─ rules/            # uyulması gereken kurallar
│  ├─ coding-standards.md · i18n-sync.md · testing.md
│  ├─ book-fidelity.md · security.md
├─ skills/           # tekrarlanan iş akışları (her biri kendi klasöründe SKILL.md)
│  ├─ add-command/   · add-lesson/   · sync-i18n/   · run-tests/
├─ agents/           # uzman alt-ajanlar
│  ├─ command-builder.md · curriculum-author.md · qa-tester.md
└─ hooks/            # otomasyon
   ├─ session-context.sh     # oturum başında kod haritasını hatırlatır
   ├─ check-i18n-sync.sh/.js # kökte js/ düzenlenince en/ aynasını hatırlatır
```

## Çoklu Ajan Tasarımı (Claude + Gemini + Jules)
- **Tek gerçek kaynak:** Tüm proje bilgisi `.claude/memory/` ve `.claude/rules/` içinde yaşar.
- **CLAUDE.md** ve **GEMINI.md** bu dosyaları `@import` ile çeker (tekrar yok).
- **AGENTS.md** (Jules/Codex) `@import` desteklemediğinden özeti kendi içinde taşır ama aynı
  dosyalara işaret eder.
- Bir kuralı/mimariyi güncellerken **yalnız `.claude/` içindeki kaynağı** düzenle; üç giriş
  dosyası otomatik güncel kalır (AGENTS.md'deki özet hariç — onu da elle eşitle).

## Hook'lar
- `SessionStart` → `session-context.sh`: kod haritası ve kritik kuralları hatırlatır.
- `PostToolUse` (Edit/Write/MultiEdit) → `check-i18n-sync.sh`: kökte `js/<x>.js` düzenlenince
  `en/js/<x>.js` aynasını güncellemeyi hatırlatır (engellemez, yalnız uyarır).

## Skills & Agents nasıl kullanılır
- **Skill** (Claude): `/add-command`, `/add-lesson`, `/sync-i18n`, `/run-tests`.
- **Agent** (Claude alt-ajan): `command-builder`, `curriculum-author`, `qa-tester` —
  ilgili işlerde otomatik veya açıkça çağrılır.
