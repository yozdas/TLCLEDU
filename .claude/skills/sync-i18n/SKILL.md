---
name: sync-i18n
description: Kök (Türkçe) js/ ile en/ (İngilizce) aynası arasındaki sapmayı tespit eder ve giderir. Kökte yapılan mantık değişikliklerini en/ tarafına taşır, görünür metinleri çevirir. "en senkronize et", "ingilizce tarafı güncelle", "i18n drift", "sync english" gibi durumlarda kullan.
---

# Skill: i18n Aynası Senkronizasyonu (kök ↔ en/)

Kural: `.claude/rules/i18n-sync.md`. Kök = Türkçe birincil; `en/` = İngilizce ayna.
`en/js/*` dosyaları kök `js/*` ile yapısal olarak **aynı**, yalnız görünür metinler farklı.

## Adımlar
1. **Sapmayı ölç.** Yapısal farkı gör (beklenen fark yalnız metin/dil olmalı):
   ```bash
   for f in app commands course fs processes terminal vim; do
     echo "===== $f ====="
     diff js/$f.js en/js/$f.js
   done
   ```
2. **Sınıflandır.** Her farkı şöyle ayır:
   - **Mantık/yapı farkı** → senkronize edilmeli (kök doğruysa en/'e taşı).
   - **Dil farkı** (Türkçe vs İngilizce kullanıcı metni) → beklenen, dokunma.
3. **Taşı/çevir.** Kökteki mantık değişikliğini `en/js/<dosya>.js`'e uygula; içindeki
   kullanıcıya görünen metinleri İngilizceye çevir. Tersi yöndeyse (en/ ileride) köke Türkçe taşı.
4. **`window.X = ...` satırı.** İki tarafta da metni birebir koru (testler buna bağlı).
5. **HTML/CSS.** `index.html`/`style.css` değiştiyse `en/index.html`/`en/style.css`'i de güncelle.
6. **Doğrula.** `bash test.sh` koş; her iki uygulamayı (`/index.html` ve `/en/index.html`)
   tarayıcıda aç ve değişen davranışı iki dilde de dene.

## Çıktı
Sonunda: hangi dosyaların senkronlandığını ve kalan **kasıtlı** dil farklarını özetle.
