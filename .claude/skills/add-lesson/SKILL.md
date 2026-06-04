---
name: add-lesson
description: TLCL müfredatına yeni bir ders/görev ekler. js/course.js içindeki courseData dizisine kitapla hizalı bir ders nesnesi ekler, gerekli komutları açar ve en/ aynasını çevirir. "ders ekle", "müfredata görev ekle", "yeni bölüm", "add a lesson" gibi isteklerde kullan.
---

# Skill: Yeni Müfredat Dersi Ekleme

Referans kitap `assets/TLCL-25.12.pdf` (bkz. `.claude/memory/book-reference.md`). Kitaba
sadakat kuralı: `.claude/rules/book-fidelity.md`. Müfredat kodu `js/course.js`.

## Ders Nesnesi Şeması (`courseData` içinde)
```js
{
    id: "X.Y",                 // "Bölüm.Adım" — kitapla ve mevcut sırayla tutarlı
    title: "Bölüm X: Başlık",
    description: "Kısa açıklama",
    text: "Açıklayıcı HTML (<code>...</code> kullan)",
    task: "Kullanıcıdan istenen somut görev",
    unlocked: [...baseUnlocked],          // bu derste kullanılabilir komutlar
    checkCompletion: (cmd, fs, term) => /* bool */,   // tamamlanma kontrolü
    onEnter: (fs) => { /* opsiyonel: derse girince ortamı hazırla */ },
    customCheck: true,         // opsiyonel: olay tabanlı tamamlama (örn. vi_exit)
}
```

## Adımlar
1. **Kitap bölümünü belirle.** Dersin hangi TLCL bölümüne karşılık geldiğini sapta; `id`'yi
   ona göre seç (örn. Bölüm 7, 3. ders → `"7.3"`). Mevcut dizideki doğru konuma yerleştir.
2. **`text` ve `task` yaz.** Türkçe, kısa ve net. Komutları `<code>...</code>` içinde göster.
3. **`checkCompletion` yaz.** Üç tarzdan birini seç:
   - Komut deseni: `(cmd) => /^ls\s+-l/.test(cmd)`
   - FS durumu: `(cmd, fs) => fs.resolvePath('belge.txt') !== null`
   - Ortam/term: `(cmd, fs, term) => term.env['PS1'] === 'test$ '`
   - Olay tabanlı: `customCheck: true` + `onEnter` içinde `window.addEventListener(...)`.
4. **Gerekli komutları aç.** Derste kullanılan tüm komutların `unlocked` listesinde (veya
   `baseUnlocked`'ta) olduğundan emin ol. Komut yoksa önce `add-command` skill'i ile ekle.
5. **`onEnter` (opsiyonel).** Ders belirli bir dizinde/dosya durumunda başlamalıysa hazırla
   (örn. `fs.currentDir = fs.resolvePath('/home/user')`).
6. **`en/` aynası.** Aynı dersi `en/js/course.js` içine, `title/description/text/task`'ı
   İngilizce çevirerek ekle; mantık (`checkCompletion` vb.) birebir aynı kalsın.
7. **Doğrula.** `bash test.sh` (kırmasın) + tarayıcıda dersi elle tamamla. en/ tarafını da dene.

## Kontrol Listesi
- [ ] Kitap bölümü teyit edildi, `id` tutarlı
- [ ] `checkCompletion` doğru tetikleniyor
- [ ] Kullanılan komutlar `unlocked`/`baseUnlocked` içinde
- [ ] `en/js/course.js` çevirisi eklendi (mantık aynı)
- [ ] Tarayıcıda elle doğrulandı
