document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const fsRoot = document.getElementById('fs-root');
    const taskBox = document.querySelector('.task-box');

    // Callback when course progresses
    const onLessonComplete = () => {
        taskBox.classList.add('success-flash');
        window.showToast("Harika! Bölümü başarıyla tamamladınız.", "success");
        setTimeout(() => {
            taskBox.classList.remove('success-flash');
        }, 1000);
    };

    // Toast Bildirim Fonksiyonu
    window.showToast = (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        else if (type === 'error') icon = '❌';

        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        // Animation in
        setTimeout(() => toast.classList.add('show'), 10);

        // Animation out
        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };

    // Modal (Bilgi Pop-up) Mantığı
    const infoModal = document.getElementById('info-modal');
    const btnInfo = document.getElementById('btn-info');
    const closeBtn1 = document.querySelector('.close-modal');
    const closeBtn2 = document.getElementById('btn-close-modal');

    const openModal = () => infoModal.classList.remove('hidden');
    const closeModal = () => {
        infoModal.classList.add('hidden');
        localStorage.setItem('tlcl_info_seen', 'true');
    };

    if (btnInfo) btnInfo.addEventListener('click', openModal);
    if (closeBtn1) closeBtn1.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);

    // Sidebar Drawer (Müfredat) Mantığı
    const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const sidebarDrawer = document.getElementById('sidebar-drawer');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    const openSidebar = () => {
        if (window.courseManager) window.courseManager.renderCurriculumList();
        sidebarDrawer.classList.remove('hidden');
        sidebarDrawer.classList.add('open');
        sidebarOverlay.classList.remove('hidden');
    };

    const closeSidebar = () => {
        sidebarDrawer.classList.remove('open');
        setTimeout(() => {
            sidebarDrawer.classList.add('hidden');
            sidebarOverlay.classList.add('hidden');
        }, 300); // match transition time
    };

    if (btnSidebarToggle) btnSidebarToggle.addEventListener('click', openSidebar);
    if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // Sonraki Derse Geçiş Mantığı (Gamification)
    const btnNextLesson = document.getElementById('btn-next-lesson');
    if (btnNextLesson) {
        btnNextLesson.addEventListener('click', () => {
            if (window.courseManager) {
                window.courseManager.nextLesson();
            }
        });
    }

    // Otomatik Karşılama
    const savedProgress = localStorage.getItem('tlcl_progress');
    if (savedProgress !== null && parseInt(savedProgress) > 0) {
        window.showToast("Kayıtlı ilerlemeniz yüklendi. Kaldığınız yerden devam ediyorsunuz.", "success");
    }

    if (!localStorage.getItem('tlcl_info_seen')) {
        openModal();
    }

    const courseManager = new CourseManager(onLessonComplete);
    window.courseManager = courseManager; 

    // Özel Onay Modalı Mantığı (Phase 7)
    window.customConfirm = (message, title = "⚠️ Onay Gerekli") => {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const msgEl = document.getElementById('confirm-message');
            const titleEl = document.getElementById('confirm-title');
            const btnOk = document.getElementById('btn-confirm-ok');
            const btnCancel = document.getElementById('btn-confirm-cancel');
            const btnClose = document.getElementById('btn-close-confirm');

            if (!modal || !msgEl) return resolve(window.confirm(message)); // Fallback

            msgEl.textContent = message;
            titleEl.textContent = title;
            modal.classList.remove('hidden');

            const cleanup = (result) => {
                modal.classList.add('hidden');
                btnOk.onclick = null;
                btnCancel.onclick = null;
                btnClose.onclick = null;
                resolve(result);
            };

            btnOk.onclick = () => cleanup(true);
            btnCancel.onclick = () => cleanup(false);
            btnClose.onclick = () => cleanup(false);
        });
    };

    // Yedekleme (Backup) Mantığı
    const btnBackup = document.getElementById('btn-backup');
    if (btnBackup) {
        btnBackup.addEventListener('click', () => {
            const state = {
                progress: localStorage.getItem('tlcl_progress') || 0,
                fs: window.fs.exportState()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "tlcl_yedek.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            window.showToast("İlerlemeniz tlcl_yedek.json olarak indirildi.", "success");
        });
    }

    // Geri Yükleme (Restore) Mantığı
    const btnRestore = document.getElementById('btn-restore');
    const fileRestore = document.getElementById('file-restore');
    
    if (btnRestore && fileRestore) {
        btnRestore.addEventListener('click', () => {
            fileRestore.click();
        });

        fileRestore.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const state = JSON.parse(event.target.result);
                    if (state.progress !== undefined) localStorage.setItem('tlcl_progress', state.progress);
                    if (state.fs) localStorage.setItem('tlcl_fs', state.fs);
                    
                    window.showToast("Yedek başarıyla yüklendi! Sayfa yenileniyor...", "success");
                    setTimeout(() => window.location.reload(), 1500);
                } catch (err) {
                    window.showToast("Yedek dosyası okunamadı veya bozuk.", "error");
                }
            };
            reader.readAsText(file);
        });
    }

    // Eğitimi Sıfırla (Reset) Mantığı
    const btnReset = document.getElementById('btn-reset');
    if(btnReset) {
        btnReset.addEventListener('click', async () => {
            const confirmed = await window.customConfirm("Tüm ilerlemeniz ve sanal dosya sisteminiz silinecek. Eğitime baştan başlamak istediğinize emin misiniz?", "⚠️ Eğitimi Sıfırla");
            if (confirmed) {
                localStorage.removeItem('tlcl_progress');
                localStorage.removeItem('tlcl_fs');
                localStorage.removeItem('tlcl_info_seen'); 
                localStorage.removeItem('tlcl_fs_init');
                window.location.reload();
            }
        });
    }

    // --- GÖRSEL DOSYA SİSTEMİ MANTIĞI (PHASE 6) ---
    const expandedPaths = new Set(['/']); // Başlangıçta root açık
    
    // Yardımcı: Node'un tam yolunu al (id olarak kullanmak için)
    const getNodePath = (node) => {
        if (node.name === '/') return '/';
        let path = node.name;
        let curr = node.parent;
        while (curr && curr.name !== '/') {
            path = curr.name + '/' + path;
            curr = curr.parent;
        }
        return '/' + path;
    };

    // Tüm yolları rekürsif olarak topla
    const getAllPaths = (node, paths = []) => {
        if (node.type === 'dir') {
            paths.push(getNodePath(node));
            for (let key in node.children) {
                getAllPaths(node.children[key], paths);
            }
        }
        return paths;
    };

    // Rekürsif ağaç render fonksiyonu
    const renderTree = (node, level = 0) => {
        const li = document.createElement('li');
        const path = getNodePath(node);
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `fs-item ${node.type}`;
        
        // Klasör ise açma/kapama ikonu ekle
        if (node.type === 'dir') {
            const hasChildren = Object.keys(node.children).length > 0;
            const toggleSpan = document.createElement('span');
            toggleSpan.className = 'toggle-icon';
            toggleSpan.innerHTML = hasChildren ? '▼' : '';
            itemDiv.prepend(toggleSpan);
            
            // Genişleme durumu kontrolü
            if (!expandedPaths.has(path) && hasChildren) {
                itemDiv.classList.add('collapsed');
            }

            // Tıklama olayı (Toggle)
            itemDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!hasChildren) return;
                
                if (expandedPaths.has(path)) {
                    expandedPaths.delete(path);
                } else {
                    expandedPaths.add(path);
                }
                updateFsTree();
            });

            // Başlangıçta Level 1 seviyesinde açık gelmesi için
            if (level === 0 && !localStorage.getItem('tlcl_fs_init')) {
                 for (let key in node.children) {
                     const child = node.children[key];
                     if (child.type === 'dir') {
                         expandedPaths.add(getNodePath(child));
                     }
                 }
                 localStorage.setItem('tlcl_fs_init', 'true');
            }
        } else {
            // Dosyalar için hizalama amaçlı boşluk
            const spacer = document.createElement('span');
            spacer.className = 'toggle-icon';
            itemDiv.prepend(spacer);
        }
        
        // Aktif klasör belirteci
        if (node === window.fs.currentDir) {
            itemDiv.style.backgroundColor = 'rgba(64, 138, 113, 0.25)';
            itemDiv.style.border = '1px solid rgba(176, 228, 204, 0.3)';
        }
        
        // Icon
        const iconSpan = document.createElement('span');
        iconSpan.className = 'icon';
        iconSpan.innerHTML = node.type === 'dir' ? '📁' : '📄';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = node.name === '/' ? 'root' : node.name;
        
        itemDiv.appendChild(iconSpan);
        itemDiv.appendChild(nameSpan);
        li.appendChild(itemDiv);

        if (node.type === 'dir' && Object.keys(node.children).length > 0) {
            const ul = document.createElement('ul');
            const children = Object.values(node.children).sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'dir' ? -1 : 1;
            });
            
            children.forEach(child => {
                ul.appendChild(renderTree(child, level + 1));
            });
            li.appendChild(ul);
        }

        return li;
    };

    const updateFsTree = () => {
        if (!fsRoot) return;
        fsRoot.innerHTML = '';
        fsRoot.appendChild(renderTree(window.fs.root));
    };

    // Tümünü Aç/Kapat Butonları
    document.getElementById('btn-expand-all')?.addEventListener('click', () => {
        const allPaths = getAllPaths(window.fs.root);
        allPaths.forEach(p => expandedPaths.add(p));
        updateFsTree();
    });

    document.getElementById('btn-collapse-all')?.addEventListener('click', () => {
        expandedPaths.clear();
        expandedPaths.add('/'); // Root açık kalsın
        updateFsTree();
    });

    // Initialize Terminal
    const terminal = new Terminal(window.fs, (cmdString, fsState) => {
        // Her komutta eğitim durumunu kontrol et
        courseManager.checkTask(cmdString, terminal);
        // Her komutta ağacı güncelle (dosya eklendiyse, klasör değiştiyse vb. görebilmek için)
        updateFsTree();
    });
    window.terminal = terminal;

    const vim = new VimEditor(terminal);
    terminal.setVim(vim);

    // İlk yüklemede ağacı çiz
    updateFsTree();
});
