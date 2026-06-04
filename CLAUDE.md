# CLAUDE.md — TLCL Eğitim

Bu, **The Linux Command Line — Interactive Training (TLCL Eğitim)** projesidir: William Shotts'ın
*"The Linux Command Line"* kitabıyla uyumlu, tarayıcı tabanlı, etkileşimli Linux komut satırı
eğitim simülatörü. %100 client-side Vanilla JavaScript (ES6+), **derleme adımı yok**.

> **Kod ararken kör arama yapma.** "Hangi kod nerede?" sorusunun cevabı aşağıda otomatik yüklenen
> **kod haritasındadır**. Önce onu kullan, gerekirse `grep` ile teyit et. Bu, token'larını korur.

## Otomatik yüklenen bağlam (hafıza)
@.claude/memory/architecture.md
@.claude/memory/book-reference.md
@.claude/memory/glossary.md

## Kurallar (uy)
@.claude/rules/coding-standards.md
@.claude/rules/i18n-sync.md
@.claude/rules/testing.md
@.claude/rules/book-fidelity.md
@.claude/rules/security.md

## Hızlı Komutlar
- Testler: `bash test.sh`  ·  Tek test: `node tests/<ad>.test.js`
- Lokal sunucu: `python -m http.server 8000` → `index.html` (TR) / `en/index.html` (EN)
- Derleme/bundler **yok**.

## En Kritik 5 Kural (özet)
1. **Bağımlılık ekleme** — Vanilla JS, tek vendor DOMPurify (`js/purify.min.js`).
2. **`en/` aynasını senkron tut** — kökte mantık değişirse `en/js/` karşılığını da güncelle.
3. **`window.X = ...` satırına dokunma** — testler birebir metne bağlı.
4. **XSS'e dikkat** — DOM'a giren her şey `escapeHTML`/DOMPurify'dan geçsin.
5. **Kitaba sadık kal** — davranış/müfredat `assets/TLCL-25.12.pdf`'e göre.

## İş Akışları (skills) & Alt-Ajanlar
- Skills: `add-command`, `add-lesson`, `sync-i18n`, `run-tests` (`.claude/skills/`).
- Alt-ajanlar: `command-builder`, `curriculum-author`, `qa-tester` (`.claude/agents/`).
- Altyapının tamamı: `.claude/README.md`.

## Geliştirme Dalı & Git
- Bu oturumun çalışma dalı: `claude/zen-carson-WGExK` (değişiklikleri buraya işle/it).
- PR'ı yalnız kullanıcı açıkça isterse aç.
