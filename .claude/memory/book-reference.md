# Referans Kaynak — "The Linux Command Line" (TLCL)

> **PROJENİN TEK GERÇEK KAYNAĞI.** Tüm müfredat, komut davranışları ve örnekler bu kitaba
> göre ilerler. Bir komutun/dersin "doğru" davranışı tartışmalıysa, **önce kitaba bak**.

## Künye
- **Başlık:** The Linux Command Line — A Complete Introduction
- **Yazar:** William E. Shotts, Jr.
- **Sürüm:** 25.12 (5. İnternet Sürümü ailesi), **533 sayfa**, PDF 1.7
- **Web:** https://linuxcommand.org/  ·  https://nostarch.com/tlcl2 (basılı 2. baskı)
- **Lisans:** Creative Commons Attribution-NonCommercial-NoDerivs (CC BY-NC-ND).
  → Kitap metni **türetilemez/değiştirilemez**; simülatör koddur ve AGPL-3.0'dır (ayrı).

## Depodaki Konum
- **PDF kitap:** `assets/TLCL-25.12.pdf` (~6.3 MB). Arayüzde **☰ Müfredat** menüsünün
  tepesindeki bağlantıdan da açılır.
- **Orijinal script'ler:** `assets/TLCL-25.12-Scripts/` — kitapta geçen ~52 ham shell script
  (`sys_info_page`, `while-menu`, `read-validate`, `trap-demo`, `longest-word`, `case-menu`,
  `array-*`, `test-integer*` ...). Simüle edilen davranışın referans çıktısı bunlardır.

## Kitabın Yapısı (müfredatın iskeleti — 4 Kısım / 36+ Bölüm)
- **Kısım 1 — Kabuğu Öğrenmek:** `pwd, cd, ls`, dosya işlemleri (`cp, mv, mkdir, rm, ln`),
  komutları tanıma (`type, which, help, man`), yönlendirme (`>, >>, |`, `cat, sort, uniq, grep, wc, tee`),
  shell'in gördükleri (genişletmeler `*, {}, ~, $`, tırnaklama), klavye, izinler (`chmod, chown, umask, su, sudo`),
  süreçler (`ps, top, jobs, bg, fg, kill`).
- **Kısım 2 — Yapılandırma ve Ortam:** ortam (`printenv, set, export, alias`), `vi/vim`,
  prompt özelleştirme (`PS1`).
- **Kısım 3 — Ortak Görevler & Temel Araçlar:** paket yönetimi, depolama (`mount, df, du, tar, gzip`),
  ağ (`ping, traceroute, ip, ssh, wget`), dosya arama (`locate, find, xargs`), arşiv/yedek,
  düzenli ifadeler (`grep`), metin işleme (`cat, sort, uniq, cut, paste, join, tr, sed, aspell`),
  format/yazdırma (`nl, fold, fmt, pr, printf, lpr`), derleme (`gcc, make`).
- **Kısım 4 — Shell Script Yazmak:** ilk script, başlangıç dosyaları, `if`/`test`/`[[ ]]`,
  `read`/klavye girdisi, akış: `while/until`, dallanma: `case`, konumsal parametreler (`$1, $@, shift, getopts`),
  `trap` ile akış kontrolü, fonksiyonlar/yerel değişkenler, dizgi & sayı işlemleri (parametre genişletme,
  aritmetik, `bc`), diziler, çeşitli (grup komutları, alt kabuk, `eval`, async, named pipes).

## Müfredat ↔ Kod Eşleşmesi
- Dersler `js/course.js` içindeki `courseData` dizisindedir; `id` alanları kabaca
  **"Bölüm.Adım"** (örn. `"4.2"` = Bölüm 4, 2. ders) biçimindedir ve kitap bölümleriyle hizalıdır.
- Bir komutu simüle ederken bayrakları/çıktı formatını kitaptaki örneklere ve
  `assets/TLCL-25.12-Scripts/` çıktısına göre doğrula.

## Çalışma Kuralı
1. Müfredat eklerken/düzenlerken ilgili bölümü PDF'te teyit et.
2. Script tabanlı dersler için referansı `assets/TLCL-25.12-Scripts/<isim>` olarak ver.
3. Kitap metnini kopyalayıp depoya gömme (CC BY-NC-ND — türetme yok); öğret, alıntılama.
