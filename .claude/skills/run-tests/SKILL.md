---
name: run-tests
description: TLCL test takımını çalıştırır, hataları teşhis eder ve yeni davranış için test ekler. Node tabanlı saf assert testleri (fs/terminal/vim/processes). "testleri çalıştır", "test ekle", "neden kırıldı", "run tests" gibi durumlarda kullan.
---

# Skill: Testleri Çalıştırma & Yazma

Test kuralı: `.claude/rules/testing.md`. Harici framework yok — Node 20 + `assert`.

## Çalıştırma
```bash
bash test.sh            # tüm takım: fs, terminal, vim, processes
node tests/fs.test.js   # tek dosya
```

## Harness Nasıl Çalışır (kritik)
Her `tests/*.test.js`:
1. İlgili `js/*.js` kaynağını okur,
2. `window.X = new Y();` / `window.X = Y;` satırını **birebir metinle siler**,
3. `module.exports = { X };` ekleyip geçici dosyadan `require` eder,
4. `document`, `localStorage`, `navigator` mock'lar.

→ **Sonuç:** `window.X = ...` satırının metni değişirse test kırılır. Yeni bir sınıfı test
edilebilir kılmak için aynı silme/mock desenini izle.

## Yeni Test Ekleme
1. Uygun dosyayı seç (yeni sınıf ise mevcut bir test'i şablon al).
2. Sınıfı harness deseniyle yükle (yukarıdaki 4 adım).
3. Davranışı `assert` ile doğrula; başarı/başarısızlık sayacı + `process.exit(exitCode)` kalıbına uy.
4. `bash test.sh` ile tümünü koştur.

## Teşhis
- Kırılma `window.X = ...` satırı değiştiyse: satırı eski metnine veya test'in beklediğine hizala.
- DOM/`localStorage` hatası: ilgili mock eksik/yanlış — test başındaki mock bloğunu kontrol et.
- CI yalnız `terminal.test.js` koşar; lokalde **mutlaka** `bash test.sh` ile tümünü doğrula.
