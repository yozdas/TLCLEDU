# AGENTS.md — TLCL Eğitim

Kodlama ajanları (Google **Jules**, OpenAI Codex, Cursor vb.) için rehber. Proje:
**The Linux Command Line — Interactive Training (TLCL Eğitim)** — William Shotts'ın
*"The Linux Command Line"* kitabıyla uyumlu, tarayıcı tabanlı, etkileşimli Linux komut satırı
eğitim simülatörü.

> Daha derin bağlam (Claude/Gemini ile **paylaşılan**) şu dosyalarda — açıp oku:
> - `.claude/memory/architecture.md` — **KOD HARİTASI** (hangi kod nerede)
> - `.claude/memory/book-reference.md` — referans kitap `assets/TLCL-25.12.pdf`
> - `.claude/memory/glossary.md` — konvansiyonlar ve tuzaklar
> - `.claude/rules/*.md` — kodlama, i18n, test, kitap-sadakati, güvenlik kuralları

## Proje Özeti
- %100 client-side **Vanilla JavaScript (ES6+)**. Framework, npm, bundler, sunucu, **derleme YOK**.
- Modüller `index.html`'de şu sırayla yüklenir ve `window.X` global'lerine bağlanır:
  `purify.min.js → fs.js → processes.js → vim.js → commands.js → terminal.js → course.js → app.js`.
- İki dil: **kök = Türkçe**, **`en/` = İngilizce aynası** (yapısal olarak aynı, metinler farklı).

## Build / Test / Çalıştırma
- **Build yok.** Tarayıcıda `index.html` aç ya da `python -m http.server 8000`.
- **Test:** `bash test.sh` (node tabanlı: fs, terminal, vim, processes). Tek tek: `node tests/<ad>.test.js`.
- Node 20 hedeflenir. Harici test framework'ü yok (saf `assert`).

## Dosya Haritası (özet — detay: `.claude/memory/architecture.md`)
| Dosya | Sorumluluk |
|---|---|
| `js/fs.js` | Sanal dosya sistemi (`FileSystem`), localStorage kalıcılığı |
| `js/processes.js` | Süreç/iş simülasyonu (`ProcessManager`) |
| `js/vim.js` | Vi/Vim simülatörü (`VimEditor`) |
| `js/commands.js` | ~100 kabuk komutu (`CommandRegistry`) |
| `js/terminal.js` | Kabuk motoru: token, genişletme, pipe, blok yapıları (`Terminal`) |
| `js/course.js` | Müfredat/dersler (`CourseManager` + `courseData`) |
| `js/app.js` | Bootstrap/UI tutkalı |
| `en/*` | Yukarıdakilerin İngilizce aynası |

## Kod Stili & Konvansiyonlar
- 4 boşluk girinti, noktalı virgül, tek tırnak; çevredeki kodun stiline uy.
- Her dosya tek `class` tanımlar, sonunda `window.X = ...` ile global'e bağlar.
- Komut imzası: `(args, stdin, term, fs) => ({ output } | { error })`.
- Kod yorumları genelde Türkçe; UI metinleri kökte Türkçe, `en/`'de İngilizce.

## ⚠️ Kritik Kurallar (bunları çiğneme)
1. **Bağımlılık ekleme.** Tek izinli vendor DOMPurify (`js/purify.min.js`).
2. **`en/` aynasını senkron tut.** Kökte `js/<x>.js` mantığını değiştirdiysen `en/js/<x>.js`'i de
   güncelle (görünür metinleri İngilizce çevir). Bkz. `.claude/rules/i18n-sync.md`.
3. **`window.X = ...` satırının metnini değiştirme.** `tests/*.test.js` bu satırı birebir metinle
   silerek modülü yükler; değişirse testler kırılır.
4. **XSS güvenliği.** Kullanıcı/komut verisini ham `innerHTML` ile basma; `term.escapeHTML()` veya
   DOMPurify kullan. Bkz. `.claude/rules/security.md`.
5. **Kitaba sadakat.** Komut davranışı ve müfredat `assets/TLCL-25.12.pdf` ve
   `assets/TLCL-25.12-Scripts/`'e göre. Kitap metnini kopyalama (CC BY-NC-ND).

## Doğrulama (PR/commit öncesi)
- [ ] `bash test.sh` geçiyor
- [ ] Kökte değişiklik varsa `en/` aynası güncellendi
- [ ] DOM'a giren yeni veri escape edildi
- [ ] Davranış kitapla tutarlı
