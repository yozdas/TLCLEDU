# Kural: Kodlama Standartları

Bu proje **Vanilla JavaScript (ES6+)** ile yazılmış, **derleme adımı olmayan**, %100 client-side
bir uygulamadır. Aşağıdaki kurallara uy:

## Zorunlu
- **Bağımlılık ekleme.** Framework, npm paketi, bundler, CSS kütüphanesi **YOK**. Tek izinli
  vendor `js/purify.min.js` (DOMPurify). Yeni bir şeye ihtiyaç varsa önce sahibine sor.
- **Modül deseni:** Her dosya tek `class` tanımlar ve **dosya sonunda** `window.X = ...` ile
  global'e bağlar. Bu satırın metnini değiştirme (testler ona bağlı).
- **Komut imzası:** `commandRegistry.register('ad', (args, stdin, term, fs) => { ... })` ve
  daima `{ output }` veya `{ error }` döndür.
- **Güvenlik:** Kullanıcı/komut kaynaklı hiçbir string'i ham `innerHTML` ile DOM'a koyma.
  `term.escapeHTML(...)` kullan veya DOMPurify'dan geçir. (Bkz. `security.md`.)
- **Yükleme sırasını koru:** `index.html` script sırası bir bağımlılık zinciridir.

## Stil
- 4 boşluk girinti, noktalı virgül, tek tırnak.
- Çevredeki kodun adlandırma ve yorum yoğunluğuna uy.
- Yorumlar mevcut dilde (kod yorumları çoğunlukla Türkçe) — çevredekiyle tutarlı ol.
- AGPL-3.0 lisanslı; telif Yusuf Özdaş. Lisans başlıklarını silme.

## Yasak
- Build/transpile gerektiren sözdizimi (JSX, TS) ekleme.
- `js/*.js.orig` / `*.rej` gibi artık dosyaları "kod" sanıp düzenleme.
