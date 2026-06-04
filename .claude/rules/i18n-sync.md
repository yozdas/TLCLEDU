# Kural: İki Dil (i18n) Senkronizasyonu — `en/` Aynası

Proje **iki dillidir**:
- **Kök** (`index.html`, `js/*`, `style.css`) → **Türkçe** UI (birincil).
- **`en/`** (`en/index.html`, `en/js/*`, `en/style.css`) → **İngilizce** aynası.

`en/js/*` dosyaları kök `js/*` ile **neredeyse birebir aynıdır**; tek fark kullanıcıya görünen
metinlerdir (ders metinleri, hata/çıktı mesajları, toast'lar).

## Kural
1. Kök `js/<dosya>.js` içinde **mantık/yapı** değiştirirsen, aynı değişikliği
   `en/js/<dosya>.js` içine de uygula.
2. Sadece **görünür metin** değiştirdiysen, karşılığını ilgili dilde çevirerek güncelle
   (Türkçe kökte, İngilizce `en/`'de).
3. `index.html` / `style.css` yapısını değiştirdiysen `en/` karşılığını da güncelle.
4. PR/commit'ten önce sapma kontrolü yap (yapısal diff'in yalnız metinlerde olması beklenir):
   ```bash
   for f in app commands course fs processes terminal vim; do
     echo "== $f =="; diff <(grep -n . js/$f.js) <(grep -n . en/js/$f.js) | head -40
   done
   ```
5. Yalnız tek tarafı güncelleyip bırakma — diller sürüklenmemeli.

> Yardımcı: `sync-i18n` skill'i bu süreci adım adım yürütür.
> Otomatik hatırlatma: `.claude/hooks/check-i18n-sync.sh` (PostToolUse) kökte `js/` düzenleyince uyarır.
