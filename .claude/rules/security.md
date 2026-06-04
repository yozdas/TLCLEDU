# Kural: Güvenlik (XSS)

Bu uygulama kullanıcı girdisini (komutlar, dosya içerikleri, ortam değişkenleri) alıp DOM'a
basar. Geçmişte birden çok XSS düzeltmesi yapıldı (toast, `bc`/eval, terminal çıktısı). Dikkatli ol.

## Kurallar
1. **Ham `innerHTML` ile kullanıcı verisi yazma.** DOM'a giren her dinamik metni:
   - `term.escapeHTML(str)` ile escape et, **veya**
   - `DOMPurify.sanitize(html)` (`js/purify.min.js`) ile temizle, **veya**
   - `textContent` / `createTextNode` kullan.
2. **Komut çıktıları** (`{ output }`, `{ error }`) ekrana basılmadan önce escape edilir —
   yeni komut yazarken bu zincire güven, ama HTML üretiyorsan kendin temizle.
3. **`eval` / `Function` kullanma.** Aritmetik için kitaptaki yaklaşımı/var olan güvenli
   ayrıştırıcıyı kullan (geçmişte `bc` eval açığı kapatıldı).
4. **localStorage'tan gelen veriye güvenme** — `importState` JSON'u doğrulanmadan DOM'a gitmemeli.
5. Şüpheye düşersen mevcut güvenli yardımcıları (escapeHTML, DOMPurify) tekrar kullan; yeni
   güvensiz yol açma.
