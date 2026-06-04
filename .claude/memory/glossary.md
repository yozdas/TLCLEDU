# Proje Sözlüğü, Konvansiyonlar ve Tuzaklar

## Terimler
- **TLCL:** The Linux Command Line (referans kitap). "TLCL Eğitim" = bu proje.
- **Curriculum / Müfredat:** `js/course.js` içindeki `courseData` ders dizisi.
- **Command / Komut:** `js/commands.js` içinde `commandRegistry.register(...)` ile kayıtlı simülasyon.
- **Shell engine:** `js/terminal.js` — tokenizasyon, genişletme, pipe, blok yapıları.
- **en/ aynası:** `en/` altındaki İngilizce kopya (kök = Türkçe).

## Kod Konvansiyonları
- Vanilla ES6+, **harici bağımlılık yok** (tek vendor: `js/purify.min.js` = DOMPurify).
- Her modül tek bir `class` tanımlar ve dosya sonunda `window.X = ...` ile global'e bağlar.
- Komut fonksiyon imzası: `(args, stdin, term, fs) => ({ output }|{ error })`.
- Kullanıcıya görünen UI metinleri kökte **Türkçe**, `en/` altında **İngilizce**.
- DOM'a giren her dinamik metin `term.escapeHTML()` veya DOMPurify'dan geçer (XSS geçmişi var).
- Girinti 4 boşluk. Noktalı virgül kullanılır. Tek tırnak tercih edilir.

## Tuzaklar (Gotchas) — zaman kazandırır
1. **`window.X = new Y();` satırına dokunma.** `tests/*.test.js` bu satırı **birebir metinle**
   silip modülü node'da yükler. Metni değiştirirsen testler kırılır.
2. **`en/` senkronizasyonu.** Kökte mantık değişikliği yaptıysan `en/js/` karşılığını da güncelle;
   yoksa iki dil sürüklenir. Bkz. `.claude/rules/i18n-sync.md`.
3. **Build yok.** Tarayıcıda `index.html` açılır / `python -m http.server`. Derleme bekleme.
4. **localStorage kalıcılığı.** FS `tlcl_fs` anahtarında saklanır; `migrateFS()` eski kayıtlara
   yeni varsayılan dosyaları enjekte eder. Yeni varsayılan dosya eklerken bunu hesaba kat.
5. **CI eksikliği:** `test.yml` yalnız `terminal.test.js` çalıştırıyor. Lokalde **`bash test.sh`**
   ile dördünü birden koştur.
6. **Cruft dosyalar:** `js/vim.js.orig`, `js/vim.js.rej` eski patch artığı — kod değil, görmezden gel.
7. **Süreçler sahte.** `ps/top` çıktısı `processes.js`'te statik; gerçek zamanlama yok.

## Sık Komutlar
| Amaç | Komut |
|---|---|
| Tüm testler | `bash test.sh` |
| Tek test | `node tests/fs.test.js` |
| Lokal sunucu | `python -m http.server 8000` |
| Performans denemesi | `node benchmark.js` / `node memory_bench.js` |
