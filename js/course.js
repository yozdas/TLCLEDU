const baseUnlocked = ['pwd', 'clear', 'ls', 'cd', 'cp', 'mv', 'rmdir', 'echo', 'cat', 'touch', 'mkdir', 'rm', 'type', 'which', 'man', 'help', 'grep', 'wc', 'sort', 'uniq', 'history', 'whoami', 'id', 'chmod', 'chown', 'ps', 'kill', 'top', 'printenv', 'export', 'alias', 'vi', 'apt', 'cowsay', 'df', 'du', 'ping', 'ifconfig', 'wget', 'locate', 'find', 'tar', 'gzip', 'gunzip', 'printf', 'nl', 'cut', 'paste', 'join', 'tr', 'sed', 'awk', 'gcc', 'make', 'bash', 'read', 'lpr', 'lpq', 'date', 'cal', 'file', 'less', 'free', 'ln', 'tee', 'unalias', 'apropos', 'whatis', 'info'];

const courseData = [
    // --- KISIM 1: Kabuğu Öğrenmek ---
    { id: "1.1", title: "Bölüm 1: Kabuk Nedir?", description: "Terminalin temelleri.", text: "Terminal, bilgisayarla metin tabanlı iletişim kurmamızı sağlayan bir arayüzdür. <code>pwd</code> komutu ile nerede olduğunuzu görebilirsiniz.", task: "Nerede olduğunuzu görmek için <code>pwd</code> yazın.", unlocked: ['pwd', 'clear', 'ls', 'cd', 'date', 'cal'], checkCompletion: (cmd) => /^pwd(\s+.*)?$/.test(cmd) },
    { id: "1.2", title: "Bölüm 1: Tarih ve Saat", description: "date ve cal.", text: "Sistem saatini <code>date</code>, takvimi <code>cal</code> ile görebilirsiniz.", task: "<code>cal</code> yazın.", unlocked: ['pwd', 'clear', 'ls', 'cd', 'date', 'cal'], checkCompletion: (cmd) => /^cal(\s+.*)?$/.test(cmd) },
    { id: "2.1", title: "Bölüm 2: Navigasyon - cd", description: "cd komutu.", text: "Dizinler arası geçiş için <code>cd</code> kullanılır. Mutlak yollar kök dizinden (<code>/</code>) başlar.", task: "<code>/usr/bin</code> dizinine gitmek için <code>cd /usr/bin</code> yazın.", unlocked: ['pwd', 'clear', 'ls', 'cd'], checkCompletion: (cmd, fs) => fs.pwd() === '/usr/bin' },
    { id: "2.2", title: "Bölüm 2: Kısayollar", description: "cd . ve cd ..", text: "<code>.</code> geçerli dizini, <code>..</code> bir üst dizini temsil eder.", task: "Bir üst dizine (<code>/usr</code>) gitmek için <code>cd ..</code> yazın.", unlocked: ['pwd', 'clear', 'ls', 'cd'], checkCompletion: (cmd, fs) => /cd\s+\.\./.test(cmd) },
    { id: "3.1", title: "Bölüm 3: ls - Listeleme", description: "ls komutu.", text: "<code>ls</code> dizin içeriğini listeler.", task: "<code>ls</code> yazın.", unlocked: ['pwd', 'clear', 'ls', 'cd'], checkCompletion: (cmd) => /^ls(\s+.*)?$/.test(cmd) },
    { id: "3.2", title: "Bölüm 3: ls -a ve -l", description: "ls bayrakları.", text: "<code>-a</code> gizli dosyaları gösterir, <code>-l</code> detaylı bilgi verir.", task: "Tüm dosyaları detaylı görmek için <code>ls -al</code> yazın.", unlocked: ['pwd', 'clear', 'ls', 'cd'], checkCompletion: (cmd) => /ls\s+.*-a.*l|ls\s+.*-l.*a/.test(cmd) },
    { id: "4.1", title: "Bölüm 4: cp - Kopyalama", description: "cp komutu.", text: "<code>cp [kaynak] [hedef]</code> dosyaları kopyalar.", task: "<code>readme.txt</code> dosyasını <code>readme_kopya.txt</code> olarak kopyalayın.", unlocked: [...baseUnlocked], onEnter: (fs) => { if(fs.resolvePath('/home/user')) fs.currentDir = fs.resolvePath('/home/user'); }, checkCompletion: (cmd, fs) => fs.resolvePath('readme_kopya.txt') !== null },
    { id: "4.2", title: "Bölüm 4: mv - Taşıma", description: "mv komutu.", text: "<code>mv</code> dosyaları taşır veya ismini değiştirir.", task: "<code>readme_kopya.txt</code> ismini <code>belge.txt</code> yapın.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs) => fs.resolvePath('belge.txt') !== null && fs.resolvePath('readme_kopya.txt') === null },
    { id: "4.3", title: "Bölüm 4: rm - Silme", description: "rm komutu.", text: "<code>rm</code> dosyaları kalıcı olarak siler.", task: "<code>belge.txt</code> dosyasını silin.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs) => fs.resolvePath('belge.txt') === null },
    { id: "5.1", title: "Bölüm 5: help ve type", description: "Komut bilgilerini öğrenme.", text: "<code>type</code> komutun türünü (builtin, alias, file) söyler.", task: "<code>type cd</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /^type\s+cd$/.test(cmd) },
    { id: "5.2", title: "Bölüm 5: man - Kılavuz", description: "man komutu.", text: "<code>man</code> kılavuz sayfalarını açar.", task: "<code>man ls</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /^man\s+ls$/.test(cmd) },
    { id: "6.1", title: "Bölüm 6: Yönlendirme >", description: "Standart Çıktı.", text: "<code>></code> çıktıyı bir dosyaya yazar.", task: "<code>ls > liste.txt</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs) => fs.resolvePath('liste.txt') !== null },
    { id: "6.2", title: "Bölüm 6: Borular |", description: "Pipeline.", text: "<code>|</code> çıktıyı diğer komuta girdi yapar.", task: "<code>ls | wc -l</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /ls\s+.*\|\s*wc/.test(cmd) },
    { id: "7.1", title: "Bölüm 7: Genişletmeler *", description: "Wildcards.", text: "<code>*</code> herhangi bir karakter dizisiyle eşleşir.", task: "<code>ls scripts/*.sh</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /ls\s+scripts\/\*\.sh/.test(cmd) },
    { id: "7.2", title: "Bölüm 7: Süslü Parantez {}", description: "Brace Expansion.", text: "<code>{a,b}</code> çoklu dizeler üretir.", task: "<code>echo test_{1,2,3}.txt</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /echo\s+.*\{1,2,3\}/.test(cmd) },
    { id: "8.1", title: "Bölüm 8: Gelişmiş Klavye", description: "History.", text: "<code>history</code> geçmiş komutları listeler.", task: "<code>history</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /^history(\s+.*)?$/.test(cmd) },
    { id: "9.1", title: "Bölüm 9: İzinler", description: "chmod.", text: "<code>chmod</code> dosya izinlerini düzenler.", task: "<code>chmod 600 notlar.txt</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /chmod\s+600\s+notlar\.txt/.test(cmd) },
    { id: "10.1", title: "Bölüm 10: Süreçler", description: "ps ve top.", text: "<code>ps</code> aktif süreçleri gösterir.", task: "<code>ps aux</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /ps\s+.*aux/.test(cmd) },

    // --- KISIM 2: Yapılandırma ve Ortam ---
    { id: "11.1", title: "Bölüm 11: Ortam", description: "printenv.", text: "Ortam değişkenlerini <code>printenv</code> ile görün.", task: "<code>printenv HOME</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /printenv\s+HOME/.test(cmd) },
    { id: "12.1", title: "Bölüm 12: Vi Editörü", description: "vi kullanımı.", text: "Linux'un klasik editörü <code>vi</code>.<br>Dosyaya girip <code>i</code> ile INSERT moda geçip bir şeyler yazıp, ardından ESC basıp <code>:wq</code> ile çıkabilirsiniz.", task: "<code>vi deneme.txt</code> yazın ve dosyadan çıkın (<code>:wq</code>).", unlocked: [...baseUnlocked], customCheck: true, onEnter: (fs) => {
        const checkViExit = () => {
            if (fs.resolvePath('deneme.txt')) {
                window.courseManager.completeLesson();
                window.removeEventListener('vi_exit', checkViExit);
            }
        };
        window.addEventListener('vi_exit', checkViExit);
    }, checkCompletion: (cmd) => false },
    { id: "13.1", title: "Bölüm 13: Prompt Özelleştirme", description: "PS1 değişkeni.", text: "<code>PS1</code> değişkeni komut istemini belirler.", task: "<code>export PS1=\"test$ \"</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs, term) => term.env['PS1'] === 'test$ ' },

    // --- KISIM 3: Ortak Görevler ---
    { id: "14.1", title: "Bölüm 14: Paket Yönetimi", description: "apt-get.", text: "Yazılım yüklemek için <code>apt</code> kullanılır (simüle).", task: "<code>apt install cowsay</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /apt\s+install\s+cowsay/.test(cmd) },
    { id: "15.1", title: "Bölüm 15: Depolama", description: "df ve du.", text: "Disk kullanımı için <code>df</code> ve <code>du</code>.", task: "<code>df -h</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /df\s+-h/.test(cmd) },
    { id: "16.1", title: "Bölüm 16: Ağ İletişimi", description: "ping.", text: "Ağ bağlantısını test eder.", task: "<code>ping 8.8.8.8</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /ping\s+8\.8\.8\.8/.test(cmd) },
    { id: "17.1", title: "Bölüm 17: Arama - find", description: "find komutu.", text: "Dosyaları bulmak için en güçlü araç <code>find</code>'dır.", task: "<code>find . -name \"*.sh\"</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /find\s+\.\s+-name/.test(cmd) },
    { id: "18.1", title: "Bölüm 18: Arşivleme", description: "tar ve gzip.", text: "<code>tar</code> paketler, <code>gzip</code> sıkıştırır.", task: "<code>tar -czf scripts.tar.gz scripts/</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs) => fs.resolvePath('scripts.tar.gz') !== null },
    { id: "19.1", title: "Bölüm 19: Metin İşleme", description: "grep.", text: "Metin içinde desen aramak için <code>grep</code>.", task: "<code>grep \"root\" /etc/passwd</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => cmd.includes('grep') && cmd.includes('root') && cmd.includes('passwd') },
    { id: "20.1", title: "Bölüm 20: sed - Metin Düzenleme", description: "sed s///g.", text: "<code>sed</code> satır bazlı düzenleme yapar.", task: "<code>echo \"hello world\" | sed 's/hello/hi/'</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => cmd.includes('sed') && cmd.includes('hello/hi') },
    { id: "20.2", title: "Bölüm 20: awk - Sütun İşleme", description: "awk '{print $1}'.", text: "<code>awk</code> verileri sütunlara böler.", task: "<code>awk -F: '{print $1}' /etc/passwd</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => cmd.includes('awk') && cmd.includes('$1') && cmd.includes('passwd') },
    { id: "21.1", title: "Bölüm 21: Çıktı Biçimlendirme", description: "pr.", text: "Yazdırmak için metni biçimlendirir.", task: "<code>pr dosya.txt</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /pr\s+dosya\.txt/.test(cmd) },
    { id: "22.1", title: "Bölüm 22: Yazdırma", description: "lpr.", text: "Dosyaları yazıcıya gönderir.", task: "<code>lpr dosya.txt</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /lpr\s+dosya\.txt/.test(cmd) },
    { id: "23.1", title: "Bölüm 23: Program Derleme", description: "make.", text: "Yapı otomasyon aracı.", task: "<code>make</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /^make(\s+.*)?$/.test(cmd) },

    // --- KISIM 4: Script Yazımı ---
    { id: "24.1", title: "Bölüm 24: İlk Script", description: "Shebang #!.", text: "Scriptler shebang ile başlar.", task: "<code>bash scripts/hello.sh</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/hello\.sh/.test(cmd) },
    { id: "25.1", title: "Bölüm 25: Değişkenler", description: "Değişken atama.", text: "<code>VAR=deger</code> şeklinde atama yapılır.", task: "<code>MSG=\"Selam\"; echo $MSG</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs, term) => term.env['MSG'] === 'Selam' },
    { id: "26.1", title: "Bölüm 26: HERE Documents", description: "<< EOF.", text: "Çok satırlı metinleri script içine gömer.", task: "<code>bash scripts/sys_info_page</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/sys_info_page/.test(cmd) },
    { id: "27.1", title: "Bölüm 27: if Kontrolü", description: "if [[ condition ]].", text: "Mantıksal kontroller için <code>if</code>.", task: "<code>bash scripts/test-integer</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/test-integer/.test(cmd) },
    { id: "28.1", title: "Bölüm 28: read - Girdi Alma", description: "read komutu.", text: "Kullanıcıdan bilgi almak için <code>read</code> kullanılır.", task: "<code>bash scripts/read-menu</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/read-menu/.test(cmd) },
    { id: "29.1", title: "Bölüm 29: while Döngüsü", description: "while [ condition ].", text: "Belli bir koşul doğru olduğu sürece döngü devam eder.", task: "<code>bash scripts/while-count</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/while-count/.test(cmd) },
    { id: "30.1", title: "Bölüm 30: Hata Ayıklama", description: "set -x.", text: "Scriptleri adım adım izlemek için <code>set -x</code> kullanılır.", task: "<code>set -x; bash scripts/hello.sh; set +x</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs, term) => term.xtrace === true || /set\s+-x/.test(cmd) },
    { id: "31.1", title: "Bölüm 31: case Seçimi", description: "case ... esac.", text: "Çoklu seçenekler için <code>case</code> daha temizdir.", task: "<code>bash scripts/case-menu</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/case-menu/.test(cmd) },
    { id: "32.1", title: "Bölüm 32: Konumsal Parametreler", description: "$1, $2, $#.", text: "Script argümanları <code>$1</code>, <code>$2</code> vb. ile alınır.", task: "<code>bash scripts/posit-param 'A' 'B' 'C'</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/posit-param\s+.*'A'/.test(cmd) },
    { id: "33.1", title: "Bölüm 33: for Döngüsü", description: "for i in list.", text: "Listedeki her öğe için işlem yapar.", task: "<code>bash scripts/longest-word scripts/*</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/longest-word/.test(cmd) },
    { id: "34.1", title: "Bölüm 34: Karakter Dizileri ve Sayılar", description: "Parametre genişletme.", text: "Gelişmiş karakter dizisi ve sayı işleme teknikleri.", task: "<code>echo ${#USER}</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /echo\s+\$\{#USER\}/.test(cmd) },
    { id: "35.1", title: "Bölüm 35: Diziler (Arrays)", description: "declare -a.", text: "Birden çok veriyi tek değişkende saklar.", task: "<code>bash scripts/array-mapfile /etc/passwd</code> yazın.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/array-mapfile/.test(cmd) },
    { id: "36.1", title: "Bölüm 36: Son Söz", description: "Mezuniyet.", text: "William Shotts'ın Linux Komut Satırı eğitimini başarıyla tamamladınız! Artık bir Bash uzmanısınız.", task: "Mezuniyet için: <code>echo 'LINUX MASTER'</code>", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /echo\s+.*LINUX MASTER/.test(cmd) }
];

class CourseManager {
    constructor(onLessonComplete) {
        this.lessons = courseData;
        const savedIndex = localStorage.getItem('tlcl_progress');
        this.maxUnlockedIndex = savedIndex ? parseInt(savedIndex) : 0;
        this.currentIndex = this.maxUnlockedIndex;
        this.onLessonComplete = onLessonComplete;
        this.unlockedCommands = new Set();
        this.updateUnlockedCommands();
        this.renderCurrentLesson();
    }

    updateUnlockedCommands() {
        this.unlockedCommands.clear();
        for (let i = 0; i <= this.maxUnlockedIndex; i++) {
            const lesson = this.lessons[i];
            if (lesson && lesson.unlocked) {
                lesson.unlocked.forEach(cmd => this.unlockedCommands.add(cmd));
            }
        }
    }

    isCommandUnlocked(cmdName) {
        return this.unlockedCommands.has(cmdName);
    }

    renderCurrentLesson() {
        const lesson = this.lessons[this.currentIndex];
        if (!lesson) return;

        // Ensure proper environment for this lesson if a setup function exists
        if (lesson.onEnter && window.fs) {
            lesson.onEnter(window.fs);
            // Optionally save the state and update tree if needed
            window.fs.saveState();
            if (typeof window.updateFsTree === 'function') {
                window.updateFsTree();
            }
        }

        document.getElementById('lesson-title').innerHTML = lesson.title;
        document.getElementById('lesson-text').innerHTML = lesson.text;
        
        const taskContainer = document.getElementById('lesson-task');
        taskContainer.innerHTML = lesson.task;
        
        const codes = taskContainer.querySelectorAll('code');
        codes.forEach(code => {
            const btn = document.createElement('button');
            btn.className = 'btn-copy-code';
            btn.innerHTML = '📋';
            btn.title = 'Kodu Kopyala';
            
            const getCodeText = () => {
                let text = '';
                code.childNodes.forEach(node => {
                    if (node !== btn) text += node.textContent;
                });
                return text.trim();
            };

            btn.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(getCodeText());
                btn.innerHTML = '✅';
                setTimeout(() => btn.innerHTML = '📋', 2000);
            };
            code.appendChild(btn);
        });

        const progress = (this.maxUnlockedIndex / (this.lessons.length - 1)) * 100;
        document.getElementById('course-progress').style.width = `${progress}%`;
        document.getElementById('progress-text').innerText = `Ders ${this.currentIndex + 1} / ${this.lessons.length}`;
        
        // Re-render curriculum list to keep sidebar highlighting, locks and status icons fully in sync
        this.renderCurriculumList();
    }

    checkTask(command, terminal) {
        const lesson = this.lessons[this.currentIndex];
        if (lesson && lesson.checkCompletion(command, terminal.fs, terminal)) {
            if (this.currentIndex === this.maxUnlockedIndex) {
                this.maxUnlockedIndex++;
                if (this.maxUnlockedIndex >= this.lessons.length) {
                    this.maxUnlockedIndex = this.lessons.length - 1;
                }
                this.currentIndex = this.maxUnlockedIndex;
                localStorage.setItem('tlcl_progress', this.maxUnlockedIndex);
            } else {
                this.currentIndex++;
                if (this.currentIndex >= this.lessons.length) {
                    this.currentIndex = this.lessons.length - 1;
                }
            }
            this.updateUnlockedCommands();
            this.renderCurrentLesson();
            if (this.onLessonComplete) this.onLessonComplete();
            return true;
        }
        return false;
    }

    renderCurriculumList() {
        const listContainer = document.getElementById('sidebar-accordion');
        if (!listContainer) return;
        listContainer.innerHTML = '';
        
        // Group lessons by Chapter
        const chapters = {};
        this.lessons.forEach((lesson, index) => {
            const chapterNum = lesson.id.split('.')[0];
            if (!chapters[chapterNum]) {
                chapters[chapterNum] = {
                    title: lesson.title.split(':')[0] + ": " + lesson.title.split(':')[1],
                    lessons: []
                };
            }
            chapters[chapterNum].lessons.push({ ...lesson, index });
        });

        Object.keys(chapters).sort((a, b) => parseInt(a) - parseInt(b)).forEach(chNum => {
            const chapter = chapters[chNum];
            const chapterEl = document.createElement('div');
            chapterEl.className = 'chapter-group';
            
            // Check if current lesson is in this chapter
            const hasActive = chapter.lessons.some(l => l.index === this.currentIndex);
            
            chapterEl.innerHTML = `
                <div class="chapter-header ${hasActive ? 'open' : ''}" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('hidden')">
                    <span class="chapter-icon">📁</span>
                    <span class="chapter-title">${chapter.title}</span>
                </div>
                <div class="chapter-content ${hasActive ? '' : 'hidden'}">
                </div>
            `;
            
            const content = chapterEl.querySelector('.chapter-content');
            chapter.lessons.forEach(lesson => {
                const item = document.createElement('div');
                const index = lesson.index;
                item.dataset.index = index;
                item.className = `curriculum-item ${index === this.currentIndex ? 'active' : ''}`;
                
                const isLocked = index > this.maxUnlockedIndex;
                if (isLocked) item.classList.add('locked');
                
                const isCompleted = index < this.maxUnlockedIndex;
                const statusIcon = isCompleted ? '✅' : (index === this.maxUnlockedIndex ? '🚀' : '🔒');
                
                item.innerHTML = `
                    <span class="curriculum-icon status-icon">${statusIcon}</span>
                    <div class="curriculum-details">
                        <div class="curriculum-title">${lesson.title.includes(':') ? lesson.title.split(':').slice(1).join(':').trim() : lesson.title}</div>
                        <div class="curriculum-desc">${lesson.description}</div>
                    </div>
                `;
                
                item.onclick = (e) => {
                    e.stopPropagation();
                    if (isLocked) {
                        if (window.showToast) {
                            window.showToast("Bu ders kilitli. Önceki dersleri tamamlamalısınız!", "error");
                        }
                        return;
                    }
                    this.goToLesson(index);
                    
                    // Smoothly auto-close the drawer on selection for both desktop and mobile
                    const sidebarDrawer = document.getElementById('sidebar-drawer');
                    const sidebarOverlay = document.getElementById('sidebar-overlay');
                    if (sidebarDrawer) {
                        sidebarDrawer.classList.remove('open');
                        setTimeout(() => {
                            sidebarDrawer.classList.add('hidden');
                            if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
                        }, 300);
                    }
                };
                content.appendChild(item);
            });
            
            listContainer.appendChild(chapterEl);
        });
    }

    nextLesson() {
        if (this.currentIndex < this.lessons.length - 1) {
            if (this.currentIndex === this.maxUnlockedIndex) {
                this.maxUnlockedIndex++;
                this.currentIndex = this.maxUnlockedIndex;
                localStorage.setItem('tlcl_progress', this.maxUnlockedIndex);
            } else {
                this.currentIndex++;
            }
            this.updateUnlockedCommands();
            this.renderCurrentLesson();
        }
    }

    goToLesson(index) {
        if (index >= 0 && index <= this.maxUnlockedIndex) {
            this.currentIndex = index;
            this.renderCurrentLesson();
        }
    }
}

window.CourseManager = CourseManager;
