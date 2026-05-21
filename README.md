# The Linux Command Line - Interactive Training (TLCL Eğitim)

An interactive, immersive, browser-based simulation designed to teach the Linux Command Line step-by-step, fully compatible with William Shotts' renowned book *"The Linux Command Line"*.

William Shotts'ın *"The Linux Command Line"* kitabı ile tam uyumlu, adım adım Linux Komut Satırı öğreten, tarayıcı tabanlı etkileşimli ve kapsamlı eğitim simülasyonu.

---

## Dil Seçimi / Language Selection
* [Türkçe Tanıtım & Kullanım Kılavuzu](#türkçe)
* [English Introduction & User Guide](#english)

---

<a name="türkçe"></a>
## 🇹🇷 Türkçe

Bu proje, Linux komut satırını sıfırdan ileri seviyeye kadar güvenli, etkileşimli ve görselleştirilmiş bir sanal ortamda öğrenmenizi sağlar. Bilgisayarınıza herhangi bir kurulum yapmadan, tamamen tarayıcınız üzerinden gerçekçi bir Linux terminalini deneyimleyebilirsiniz.

### 📚 Kitap ve Orijinal Scriptler (Assets)
Eğitimi çok daha verimli bir şekilde takip edebilmeniz için gerekli tüm kaynaklar deponun [assets/](file:///c:/Users/yusuf.ozdas/Desktop/_Projeler/TLC_egitim/assets) klasöründe yer almaktadır:
* **Eğitim Kitabı (PDF):** William Shotts'ın ünlü eseri *"The Linux Command Line"* kitabının PDF sürümüne [assets/TLCL-25.12.pdf](file:///c:/Users/yusuf.ozdas/Desktop/_Projeler/TLC_egitim/assets/TLCL-25.12.pdf) adresinden doğrudan ulaşabilirsiniz. Ayrıca eğitim arayüzündeki **☰ Müfredat** menüsünün en tepesinde yer alan bağlantıyı kullanarak da kitaba anında ulaşabilir, okurken bir yandan da terminalde pratik yapabilirsiniz.
* **Orijinal Scriptler:** Kitaptaki derslerde ve kabuk programlama bölümlerinde geçen tüm orijinal scriptlerin ham halleri [assets/TLCL-25.12-Scripts/](file:///c:/Users/yusuf.ozdas/Desktop/_Projeler/TLC_egitim/assets/TLCL-25.12-Scripts) klasöründe yer alır. Bilgisayarınıza kopyalayıp kendi Linux kabuğunuzda test edebilirsiniz.

### 🌟 Öne Çıkan Özellikler

* **Gelişmiş Terminal Simülasyonu:** JavaScript ile yazılmış, komut geçmişi (history), yönlendirmeler (`>`, `|`), konumsal parametreler (`$1`, `$2`), `until` ve `while` döngüleri ile `case` yapısını destekleyen gelişmiş kabuk motoru.
* **Görsel Dosya Sistemi Durumu:** Yaptığınız dosya işlemlerini (klasör oluşturma, taşıma, silme) anlık olarak gösteren interaktif, dinamik ve genişletilebilir görsel ağaç yapısı.
* **80+ Dersten Oluşan Müfredat:** Kitaptaki bölümlerle %100 uyumlu, temel navigasyondan Bash script yazımına ve hata ayıklamaya (`set -x`) kadar uzanan geniş kapsamlı görevler.
* **Simüle Edilmiş Vim Editörü:** Terminal içinden çalıştırılabilen, mod tabanlı (Insert/Normal) temel metin düzenleme yeteneklerine sahip Vi/Vim simülasyonu.
* **Gelişmiş Metin İşleme:** Gerçekçi `grep`, `sed` (yer değiştirme), `awk` (sütun işleme), `tr` (karakter dönüşümü), `cut`, `printf` komut entegrasyonları.
* **İlerleme Yönetimi (Yedekle/Yükle):** Tarayıcı önbelleğine otomatik kayıt. İlerlemeyi `.json` formatında bilgisayara yedekleme (Download) ve geri yükleme (Restore) desteği.
* **Çift Dil Desteği:** Tek bir tıklama ile Türkçe ve İngilizce dilleri arasında dinamik geçiş olanağı.

### 🛠️ Teknolojik Altyapı
Bu uygulama tamamen **istemci tarafında (client-side)** çalışır.
* **Arayüz:** HTML5, modern cam efekti (glassmorphism) ve Matrix esintili tarama çizgileri barındıran zengin CSS3 tasarımı.
* **Mantık:** Vanilla JavaScript (ES6+). Hiçbir harici framework, veritabanı veya sunucu tabanlı teknoloji kullanılmamıştır.
* **Veri Saklama:** HTML5 Web Storage API (`localStorage`).

### 📦 Kurulum ve Çalıştırma

Projeyi yerelde çalıştırmak oldukça basittir:
1. Depoyu bilgisayarınıza indirin veya klonlayın.
2. Proje kök dizinindeki `index.html` dosyasına çift tıklayarak tarayıcınızda doğrudan açın.
3. *Alternatif olarak:* Geliştirme yapıyorsanız, proje dizininde bir yerel sunucu başlatabilirsiniz:
   ```bash
   # Python 3 ile
   python -m http.server 8000
   
   # Veya VS Code Live Server eklentisini kullanabilirsiniz.
   ```

### ☁️ GitHub Pages Dağıtımı
Proje tamamen statik olduğu için GitHub Pages üzerinde sorunsuz çalışır. Kök dizindeki `.nojekyll` dosyası sayesinde Jekyll derleme motoru atlanarak hızlı ve hatasız bir yayın sağlanır.

1. Deponuzu GitHub'a yükleyin.
2. Depo ayarlarından **Settings > Pages** sekmesine gidin.
3. Kaynak olarak `main` dalını (branch) ve `/ (root)` dizinini seçip **Save** deyin.

---

<a name="english"></a>
## 🇬🇧 English

This project provides a secure, interactive, and visualized virtual environment to learn the Linux command line from scratch to an advanced level. Without any installation on your machine, you can experience a realistic Linux terminal directly in your web browser.

### 📚 Book and Original Scripts (Assets)
To make your learning journey seamless, all necessary learning materials are included in the [assets/](file:///c:/Users/yusuf.ozdas/Desktop/_Projeler/TLC_egitim/assets) folder of this repository:
* **Training Book (PDF):** You can access the official PDF version of William Shotts' famous book *"The Linux Command Line"* directly at [assets/TLCL-25.12.pdf](file:///c:/Users/yusuf.ozdas/Desktop/_Projeler/TLC_egitim/assets/TLCL-25.12.pdf). You can also launch the book instantly via the link at the very top of the **☰ Curriculum** sidebar menu inside the training web interface to study concurrently!
* **Original Scripts:** All 52 raw shell scripts mentioned in the scripting sections of the book can be found in the [assets/TLCL-25.12-Scripts/](file:///c:/Users/yusuf.ozdas/Desktop/_Projeler/TLC_egitim/assets/TLCL-25.12-Scripts) directory for your direct review and local testing.

### 🌟 Key Features

* **Advanced Terminal Simulation:** An advanced shell engine written in JavaScript, supporting command history, redirections (`>`, `|`), positional parameters (`$1`, `$2`), `until` & `while` loops, and `case` structures.
* **Visual Filesystem Status:** An interactive, dynamic, and expandable visual tree structure showing your file operations (directory creation, moving, deletion) in real-time.
* **80+ Lesson Curriculum:** 100% compatible with the book, featuring extensive hands-on tasks ranging from basic navigation to Bash scripting and debugging (`set -x`).
* **Simulated Vim Editor:** A Vi/Vim simulator launched from within the terminal, featuring basic mode-based (Insert/Normal) text editing.
* **Rich Text Processing:** Realistic command implementations of `grep`, `sed` (substitution), `awk` (column processing), `tr` (character translation), `cut`, and `printf`.
* **Progress Management (Backup/Restore):** Automatic saving to browser local storage. Download progress in `.json` format and easily restore it on another browser/device.
* **Dual-Language Support:** Easily switch between Turkish and English training modes with a single click.

### 🛠️ Technical Stack
The application is entirely **client-side**:
* **Frontend:** Modern CSS3 layout with glassmorphism and retro Matrix-inspired scanline effects.
* **Logic:** Vanilla JavaScript (ES6+). No external frameworks, databases, or server-side hosting dependencies required.
* **Storage:** HTML5 Web Storage API (`localStorage`).

### 📦 Local Quickstart

Running the project locally is extremely simple:
1. Download or clone this repository to your computer.
2. Double-click the `index.html` file in the project root to open it directly in your browser.
3. *Alternatively:* If you want to run it via a local development server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or use VS Code's Live Server extension.
   ```

### ☁️ GitHub Pages Deployment
Since the project is fully static, it is perfectly suited for GitHub Pages. The `.nojekyll` file at the root bypasses the Jekyll compiler for instant, error-free hosting.

1. Push your repository to GitHub.
2. Navigate to **Settings > Pages** in your repository.
3. Select the `main` branch and `/ (root)` folder as the source, then click **Save**.

---

## 📜 Lisans ve Teşekkür / License & Acknowledgements
* This project is inspired by and designed as a learning companion for **William Shotts'** book **"The Linux Command Line"**.
* Bu proje **William Shotts**'ın **"The Linux Command Line"** kitabından ilham alınarak, eğitime yardımcı bir araç olarak geliştirilmiştir.
* The codebase is licensed under the protective **GNU Affero General Public License v3 (AGPL-3.0)**. See the [LICENSE](file:///c:/Users/yusuf.ozdas/Desktop/_Projeler/TLC_egitim/LICENSE) file for details. Copyright (c) 2026 **Yusuf Özdaş**.
* Proje kod tabanı güçlü bir koruyucu açık kaynak lisansı olan **GNU Affero Genel Kamu Lisansı v3 (AGPL-3.0)** ile lisanslanmıştır. Detaylar için [LICENSE](file:///c:/Users/yusuf.ozdas/Desktop/_Projeler/TLC_egitim/LICENSE) dosyasına göz atabilirsiniz. Telif Hakkı (c) 2026 **Yusuf Özdaş**.


