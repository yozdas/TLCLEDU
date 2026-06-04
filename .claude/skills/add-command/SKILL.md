---
name: add-command
description: TLCL simülatörüne yeni bir kabuk komutu (örn. ls, grep benzeri) ekler. Komutu js/commands.js içine kaydeder, en/ aynasını günceller, gerekiyorsa müfredatta açar ve test ekler. "yeni komut ekle", "X komutunu simüle et", "add a command" gibi isteklerde kullan.
---

# Skill: Yeni Kabuk Komutu Ekleme

TLCL simülatörüne yeni bir komut eklemenin uçtan uca akışı. Kod haritası için
`.claude/memory/architecture.md`, davranış referansı için `.claude/memory/book-reference.md`.

## Adımlar

1. **Davranışı kitaptan doğrula.** `assets/TLCL-25.12.pdf` ve gerekiyorsa
   `assets/TLCL-25.12-Scripts/` ile komutun bayrakları ve çıktı formatını netleştir.

2. **`js/commands.js` içine kaydet.** `registerBuiltins()` içinde benzer bir komutu örnek al:
   ```js
   this.register('komutadi', (args, stdin, term, fs) => {
       // args: string[]  (genişletilmiş argümanlar, bayraklar dahil)
       // stdin: string    (pipe ile gelen önceki çıktı; yoksa undefined/'')
       // term:  Terminal  (env, escapeHTML, aliases...)
       // fs:    FileSystem (resolvePath, readFile, writeFile...)
       if (/* hata durumu */ false) {
           return { error: `komutadi: <mesaj>` };
       }
       return { output: /* string sonuç */ '' };
   });
   ```
   - Daima `{ output }` veya `{ error }` döndür.
   - HTML üretiyorsan `term.escapeHTML(...)` ile temizle (bkz. `.claude/rules/security.md`).
   - Bayrak ayrıştırmada mevcut komutların (`ls`, `grep`) stiline uy.

3. **Pipe/yönlendirme.** Komut pipe'tan veri okuyacaksa `stdin`'i kullan; çıktısı pipe'lanabilir
   olacak şekilde düz string döndür. Parse tarafı `js/terminal.js` `executePipeline` halleder.

4. **`en/` aynasını güncelle.** Aynı komutu `en/js/commands.js` içine, kullanıcıya görünen
   mesajları İngilizce vererek ekle. Bkz. `.claude/rules/i18n-sync.md`.

5. **Müfredatta aç (opsiyonel).** Komutun kullanılacağı ders varsa `js/course.js` içinde ilgili
   dersin `unlocked` listesine ve gerekiyorsa `baseUnlocked`'a ekle.

6. **Test ekle.** `tests/terminal.test.js` (veya uygun dosya) içine komutu kapsayan bir senaryo
   ekle. `bash test.sh` ile tüm takımı koştur.

7. **Doğrula.** `python -m http.server 8000` ile aç, komutu elle dene; en/ tarafını da kontrol et.

## Kontrol Listesi
- [ ] `js/commands.js` kaydı yapıldı, `{output}|{error}` döndürüyor
- [ ] Çıktı XSS-güvenli (escapeHTML/DOMPurify)
- [ ] `en/js/commands.js` aynası güncellendi
- [ ] Gerekliyse `js/course.js` unlock + `en/js/course.js`
- [ ] Test eklendi, `bash test.sh` geçiyor
