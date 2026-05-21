# Contributing to TLC_egitim / Katkı Sağlama Kılavuzu

Welcome! We are thrilled that you are interested in contributing to **TLC_egitim**. By contributing to this project, you help make Linux education more interactive and accessible for everyone.

Hoş geldiniz! **TLC_egitim** projesine katkıda bulunmak istemenizden dolayı büyük heyecan duyuyoruz. Bu projeye katkı sağlayarak, Linux eğitimini herkes için daha etkileşimli ve erişilebilir hale getirmeye yardımcı oluyorsunuz.

---

## Dil Seçimi / Language Selection
* [Katkı Kılavuzu (Türkçe)](#türkçe)
* [Contributing Guidelines (English)](#english)

---

<a name="türkçe"></a>
## 🇹🇷 Türkçe Katkı Sağlama Kılavuzu

Bu proje tamamen açık kaynaklı olup, topluluğun katılımıyla büyümektedir. Katkıda bulunmak için profesyonel bir yazılımcı olmanıza gerek yok; dokümantasyon düzeltmek, yeni eğitim modülleri eklemek veya hata bildirmek de çok değerli birer katkıdır.

### Nasıl Katkı Sağlayabilirsiniz?

#### 1. Hata Bildirimi (Reporting Bugs)
Bir hata veya eksiklik fark ederseniz, lütfen GitHub üzerinde bir **Issue (Hata Kaydı)** açın. Issue açarken:
- Hatanın ne olduğunu açıkça tarif edin.
- Hatayı yeniden üretmek (reproduce) için hangi adımları izlediğinizi yazın.
- Kullandığınız tarayıcıyı ve işletim sistemini belirtin.

#### 2. Yeni Özellik Önerme (Feature Requests)
Eğitime yeni dersler, terminale yeni komut simülasyonları eklenmesini istiyorsanız, bir Issue açarak bunu bize bildirebilir veya kendiniz geliştirebilirsiniz.

#### 3. Kod Geliştirme (Pull Requests)
Eğer kod yazarak katkı sağlamak isterseniz, lütfen şu adımları izleyin:

1. Projeyi kendi GitHub hesabınıza **Fork** edin.
2. Fork ettiğiniz depoyu yerel bilgisayarınıza klonlayın:
   ```bash
   git clone https://github.com/kullanici_adi/TLC_egitim.git
   ```
3. Yeni bir geliştirme dalı (branch) oluşturun:
   ```bash
   git checkout -b feature/yeni-ozellik
   ```
4. Değişikliklerinizi yapın ve yerel ortamda test edin.
5. Değişikliklerinizi commit edin (açıklayıcı commit mesajları yazmaya özen gösterin):
   ```bash
   git commit -m "Eğitime 15.3 dersi eklendi ve touch komut hatası düzeltildi"
   ```
6. Dalınızı GitHub'a push edin:
   ```bash
   git push origin feature/yeni-ozellik
   ```
7. Kendi deponuz üzerinden ana depoya bir **Pull Request (PR)** gönderin.

### Kodlama Kuralları
- JavaScript kodlarında ES6+ standartlarına uyunuz.
- UI bileşenleri için yeni kütüphaneler eklemek yerine mevcut vanilla CSS sistemini kullanınız.
- Eklediğiniz yeni eğitim derslerinin `course.js` (ve `en/js/course.js`) dosyalarındaki yapıyla tam uyumlu olduğundan emin olunuz.

---

<a name="english"></a>
## 🇬🇧 English Contributing Guidelines

This project is entirely open-source and grows with the community's support. You do not need to be a senior developer to contribute; fixing typos, improving documentation, adding lessons, or reporting bugs are all highly valuable contributions.

### How Can You Contribute?

#### 1. Reporting Bugs
If you spot a bug or a missing feature, please open an **Issue** on GitHub. When opening an issue:
- Describe the bug clearly.
- List the steps required to reproduce the bug.
- Mention your web browser and operating system.

#### 2. Feature Requests
If you want to suggest new terminal command simulations or new modules to the curriculum, feel free to open a feature request issue or implement it yourself.

#### 3. Code Contributions (Pull Requests)
If you want to contribute to the codebase, please follow these steps:

1. **Fork** the repository to your own GitHub account.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your_username/TLC_egitim.git
   ```
3. Create a new branch for your feature/bugfix:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. Implement your changes and test them locally in your browser.
5. Commit your changes with descriptive commit messages:
   ```bash
   git commit -m "Add new Vim shortcuts and fix cd command edge-case"
   ```
6. Push your branch to GitHub:
   ```bash
   git push origin feature/amazing-feature
   ```
7. Submit a **Pull Request (PR)** to our main repository.

### Coding Standards
- Follow modern ES6+ JavaScript standards.
- Use the existing vanilla CSS setup and visual theme guidelines; avoid introducing unnecessary external UI libraries.
- Ensure that any new lessons or modifications align perfectly with the structures inside `js/course.js` and `en/js/course.js`.
