document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const fsRoot = document.getElementById('fs-root');
    const taskBox = document.querySelector('.task-box');

    // Callback when course progresses
    const onLessonComplete = () => {
        taskBox.classList.add('success-flash');
        window.showToast("Great! You have successfully completed the chapter.", "success");
        setTimeout(() => {
            taskBox.classList.remove('success-flash');
        }, 1000);
    };

    // Toast Notification Function
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

    // Modal (Info Pop-up) Logic
    const infoModal = document.getElementById('info-modal');
    const btnInfo = document.getElementById('btn-info');
    const closeBtn1 = document.querySelector('.close-modal');
    const closeBtn2 = document.getElementById('btn-close-modal');

    const openModal = () => infoModal.classList.remove('hidden');
    const closeModal = () => {
        infoModal.classList.add('hidden');
        localStorage.setItem('tlcl_info_seen_en', 'true');
    };

    if (btnInfo) btnInfo.addEventListener('click', openModal);
    if (closeBtn1) closeBtn1.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);

    // Sidebar Drawer (Curriculum) Logic
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

    // Next Lesson Logic (Gamification)
    const btnNextLesson = document.getElementById('btn-next-lesson');
    if (btnNextLesson) {
        btnNextLesson.addEventListener('click', () => {
            if (window.courseManager) {
                window.courseManager.nextLesson();
            }
        });
    }

    // Language Switcher Logic
    const btnLangTr = document.getElementById('btn-lang-tr');
    if (btnLangTr) {
        btnLangTr.addEventListener('click', () => {
            localStorage.setItem('tlcl_lang', 'tr');
            window.location.href = '../index.html';
        });
    }

    // Automatic Welcome
    const savedProgress = localStorage.getItem('tlcl_progress_en');
    if (savedProgress !== null && parseInt(savedProgress) > 0) {
        window.showToast("Your saved progress has been loaded. Continuing where you left off.", "success");
    }

    if (!localStorage.getItem('tlcl_info_seen_en') && localStorage.getItem('tlcl_lang') === 'en') {
        openModal();
    }

    const courseManager = new CourseManager(onLessonComplete);
    window.courseManager = courseManager; 

    // Custom Confirm Modal Logic
    window.customConfirm = (message, title = "⚠️ Confirmation Required") => {
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

    // Backup Logic
    const btnBackup = document.getElementById('btn-backup');
    if (btnBackup) {
        btnBackup.addEventListener('click', () => {
            const state = {
                progress: localStorage.getItem('tlcl_progress_en') || 0,
                fs: window.fs.exportState()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "tlcl_backup_en.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            window.showToast("Your progress has been downloaded as tlcl_backup_en.json.", "success");
        });
    }

    // Restore Logic
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
                    if (state.progress !== undefined) localStorage.setItem('tlcl_progress_en', state.progress);
                    if (state.fs) localStorage.setItem('tlcl_fs_en', state.fs);
                    
                    window.showToast("Backup successfully loaded! Reloading page...", "success");
                    setTimeout(() => window.location.reload(), 1500);
                } catch (err) {
                    window.showToast("Backup file could not be read or is corrupted.", "error");
                }
            };
            reader.readAsText(file);
        });
    }

    // Reset Logic
    const btnReset = document.getElementById('btn-reset');
    if(btnReset) {
        btnReset.addEventListener('click', async () => {
            const confirmed = await window.customConfirm("All your progress and virtual filesystem will be deleted. Are you sure you want to restart the training from the beginning?", "⚠️ Reset Training");
            if (confirmed) {
                localStorage.removeItem('tlcl_progress_en');
                localStorage.removeItem('tlcl_fs_en');
                localStorage.removeItem('tlcl_info_seen_en'); 
                localStorage.removeItem('tlcl_fs_init_en');
                window.location.reload();
            }
        });
    }

    // --- VISUAL FILESYSTEM TREE LOGIC ---
    const expandedPaths = new Set(['/']); // Root open by default
    
    // Helper: Get node absolute path (to use as ID)
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

    // Recursively collect all paths
    const getAllPaths = (node, paths = []) => {
        if (node.type === 'dir') {
            paths.push(getNodePath(node));
            for (let key in node.children) {
                getAllPaths(node.children[key], paths);
            }
        }
        return paths;
    };

    // Recursive tree render function
    const renderTree = (node, level = 0) => {
        const li = document.createElement('li');
        const path = getNodePath(node);
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `fs-item ${node.type}`;
        
        // Add collapse/expand icon for folders
        if (node.type === 'dir') {
            const hasChildren = Object.keys(node.children).length > 0;
            const toggleSpan = document.createElement('span');
            toggleSpan.className = 'toggle-icon';
            toggleSpan.innerHTML = hasChildren ? '▼' : '';
            itemDiv.prepend(toggleSpan);
            
            // Collapse state check
            if (!expandedPaths.has(path) && hasChildren) {
                itemDiv.classList.add('collapsed');
            }

            // Click event (Toggle)
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

            // Auto-open Level 1 folders on first load
            if (level === 0 && !localStorage.getItem('tlcl_fs_init_en')) {
                 for (let key in node.children) {
                     const child = node.children[key];
                     if (child.type === 'dir') {
                          expandedPaths.add(getNodePath(child));
                     }
                 }
                 localStorage.setItem('tlcl_fs_init_en', 'true');
            }
        } else {
            // Spacer for alignment on files
            const spacer = document.createElement('span');
            spacer.className = 'toggle-icon';
            itemDiv.prepend(spacer);
        }
        
        // Active directory indicator
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

    // Expand/Collapse All Buttons
    document.getElementById('btn-expand-all')?.addEventListener('click', () => {
        const allPaths = getAllPaths(window.fs.root);
        allPaths.forEach(p => expandedPaths.add(p));
        updateFsTree();
    });

    document.getElementById('btn-collapse-all')?.addEventListener('click', () => {
        expandedPaths.clear();
        expandedPaths.add('/'); // Keep root open
        updateFsTree();
    });

    // Initialize Terminal
    const terminal = new Terminal(window.fs, (cmdString, fsState) => {
        // Check curriculum status on each command
        courseManager.checkTask(cmdString, terminal);
        // Update tree on each command (to see new files, dir changes, etc.)
        updateFsTree();
    });
    window.terminal = terminal;

    const vim = new VimEditor(terminal);
    terminal.setVim(vim);

    // Initial tree draw
    updateFsTree();
});
