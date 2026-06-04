# Kural: Kitaba Sadakat (Book Fidelity)

Bu projenin tek gerçek kaynağı **`assets/TLCL-25.12.pdf`** (William Shotts, *The Linux Command
Line*) kitabıdır. Bkz. `.claude/memory/book-reference.md`.

## Kurallar
1. **Davranış kitaptan gelir.** Bir komutun bayrakları, çıktı formatı veya bir dersin akışı
   tartışmalıysa, kitaptaki ilgili bölüme ve `assets/TLCL-25.12-Scripts/` örneklerine göre karar ver.
2. **Müfredat hizası.** Yeni ders (`js/course.js`) eklerken hangi kitap bölümüne karşılık
   geldiğini belirle; `id` alanını `Bölüm.Adım` mantığında ve mevcut sıralamayla tutarlı seç.
3. **Script dersleri.** Shell script konuları için referans, `assets/TLCL-25.12-Scripts/` içindeki
   ilgili ham script'tir (örn. `sys_info_page`, `while-menu`, `read-validate`). Simüle edilen
   çıktı bunlarla tutarlı olmalı.
4. **Telif/Lisans.** Kitap CC BY-NC-ND'dir: metnini kopyalayıp depoya **gömme/türetme**. Kavramı
   kendi sözcüklerinle öğret; gerekiyorsa "Bölüm X, TLCL" diye atıf ver.
5. **Gerçekçilik > eksiksizlik.** Simülasyon, kitaptaki örneği inandırıcı kılacak kadar gerçekçi
   olmalı; gerçek Linux'un her köşe durumunu taklit etmek zorunda değil.
