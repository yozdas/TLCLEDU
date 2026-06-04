# Kural: Test

## Çalıştırma
- Değişiklikten sonra **`bash test.sh`** ile tüm testleri koştur (fs, terminal, vim, processes).
- Tek tek: `node tests/<ad>.test.js`.
- Node 20 hedeflenir (CI ile aynı). Harici test framework'ü yok — saf `assert`.

## Test Harness'ının Çalışma Şekli (önemli)
`tests/*.test.js` dosyaları:
1. İlgili `js/*.js` kaynağını okur,
2. `window.X = new Y();` / `window.X = Y;` satırını **birebir metinle siler**,
3. `module.exports = { X };` ekleyip geçici dosyadan `require` eder,
4. `document`, `localStorage`, `navigator` gibi tarayıcı API'lerini **mock**'lar.

**Sonuç:** `window.X = ...` satırının metnini değiştirirsen ilgili test bozulur. Yeni bir
sınıfı test edilebilir yapmak için aynı deseni izle.

## Beklentiler
- Davranış değiştiren her değişiklik için ilgili `tests/*.test.js`'i güncelle/ekle.
- Komut/parse mantığı eklerken en azından `terminal.test.js` veya yeni bir test ile kapsa.
- Testler **kökü** kaynak alır; `en/` için mantık aynı olduğundan ayrı test gerekmez,
  ama `en/` mantığını da senkron tut (bkz. `i18n-sync.md`).

## CI Notu
`.github/workflows/test.yml` şu an yalnız `terminal.test.js` çalıştırıyor (eksik kapsam).
Lokalde tam takımı koşmak senin sorumluluğun.
