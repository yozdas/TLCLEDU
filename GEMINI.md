# GEMINI.md — TLCL Eğitim

Bu dosya **Gemini CLI** içindir. Proje: **The Linux Command Line — Interactive Training
(TLCL Eğitim)** — William Shotts'ın *"The Linux Command Line"* kitabıyla uyumlu, tarayıcı tabanlı,
etkileşimli Linux komut satırı eğitim simülatörü. %100 client-side Vanilla JavaScript (ES6+),
**derleme adımı yok**.

> Proje bilgisi tek kaynaktan yönetilir. Claude, Gemini ve Jules **aynı** mimari/kural
> dosyalarını paylaşır. Aşağıdaki `@import`'lar bu ortak bilgiyi yükler. Kod ararken önce
> **kod haritasını** kullan, kör arama yapma.

## Ortak proje bilgisi (paylaşılan hafıza)
@.claude/memory/architecture.md
@.claude/memory/book-reference.md
@.claude/memory/glossary.md

## Ortak kurallar
@.claude/rules/coding-standards.md
@.claude/rules/i18n-sync.md
@.claude/rules/testing.md
@.claude/rules/book-fidelity.md
@.claude/rules/security.md

## Gemini için hızlı notlar
- Testler: `bash test.sh`. Derleme/bundler yok. Lokal: `python -m http.server 8000`.
- En kritik kurallar: bağımlılık ekleme; `en/` aynasını senkron tut; `window.X = ...` satırına
  dokunma; DOM'a giren veriyi escape et; davranışı `assets/TLCL-25.12.pdf` kitabına göre belirle.
- İş akışı rehberleri `.claude/skills/` altında (Gemini bunları otomatik çalıştırmasa da
  adım adım izlek olarak okuyabilirsin).
