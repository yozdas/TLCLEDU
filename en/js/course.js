const baseUnlocked = ['pwd', 'clear', 'ls', 'cd', 'cp', 'mv', 'rmdir', 'echo', 'cat', 'touch', 'mkdir', 'rm', 'type', 'which', 'man', 'help', 'grep', 'wc', 'sort', 'uniq', 'history', 'whoami', 'id', 'chmod', 'chown', 'ps', 'kill', 'top', 'printenv', 'export', 'alias', 'vi', 'apt', 'cowsay', 'df', 'du', 'ping', 'ifconfig', 'wget', 'locate', 'find', 'tar', 'gzip', 'gunzip', 'printf', 'nl', 'cut', 'paste', 'join', 'tr', 'sed', 'awk', 'gcc', 'make', 'bash', 'read', 'lpr', 'lpq', 'date', 'cal', 'file', 'less', 'free', 'ln', 'tee', 'unalias', 'apropos', 'whatis', 'info'];

const courseData = [
    // --- PART 1: Learning the Shell ---
    { id: "1.1", title: "Chapter 1: What is the Shell?", description: "Basics of the terminal.", text: "The terminal is an interface that allows us to interact with the computer using text-based commands. You can see where you are in the filesystem by using the <code>pwd</code> command.", task: "Type <code>pwd</code> to see your current directory.", unlocked: ['pwd', 'clear', 'ls', 'cd', 'date', 'cal'], checkCompletion: (cmd) => /^pwd(\s+.*)?$/.test(cmd) },
    { id: "1.2", title: "Chapter 1: Date and Time", description: "date and cal.", text: "You can view the system date and time with <code>date</code>, and the calendar with <code>cal</code>.", task: "Type <code>cal</code>.", unlocked: ['pwd', 'clear', 'ls', 'cd', 'date', 'cal'], checkCompletion: (cmd) => /^cal(\s+.*)?$/.test(cmd) },
    { id: "2.1", title: "Chapter 2: Navigation - cd", description: "cd command.", text: "<code>cd</code> is used to navigate between directories. Absolute pathnames begin with the root directory (<code>/</code>).", task: "Type <code>cd /usr/bin</code> to navigate to the /usr/bin directory.", unlocked: ['pwd', 'clear', 'ls', 'cd'], checkCompletion: (cmd, fs) => fs.pwd() === '/usr/bin' },
    { id: "2.2", title: "Chapter 2: Shortcuts", description: "cd . and cd ..", text: "<code>.</code> represents the current directory, and <code>..</code> represents the parent directory.", task: "Type <code>cd ..</code> to go to the parent directory (<code>/usr</code>).", unlocked: ['pwd', 'clear', 'ls', 'cd'], checkCompletion: (cmd, fs) => /cd\s+\.\./.test(cmd) },
    { id: "3.1", title: "Chapter 3: ls - Listing", description: "ls command.", text: "<code>ls</code> lists the contents of a directory.", task: "Type <code>ls</code>.", unlocked: ['pwd', 'clear', 'ls', 'cd'], checkCompletion: (cmd) => /^ls(\s+.*)?$/.test(cmd) },
    { id: "3.2", title: "Chapter 3: ls -a and -l", description: "ls flags.", text: "<code>-a</code> lists all files, including hidden ones, while <code>-l</code> displays detailed information about files.", task: "Type <code>ls -al</code> to view all files with detailed info.", unlocked: ['pwd', 'clear', 'ls', 'cd'], checkCompletion: (cmd) => /ls\s+.*-a.*l|ls\s+.*-l.*a/.test(cmd) },
    { id: "4.1", title: "Chapter 4: cp - Copying", description: "cp command.", text: "<code>cp [source] [destination]</code> copies files.", task: "Copy the <code>readme.txt</code> file as <code>readme_copy.txt</code>.", unlocked: [...baseUnlocked], onEnter: (fs) => { if(fs.resolvePath('/home/user')) fs.currentDir = fs.resolvePath('/home/user'); }, checkCompletion: (cmd, fs) => fs.resolvePath('readme_copy.txt') !== null },
    { id: "4.2", title: "Chapter 4: mv - Moving", description: "mv command.", text: "<code>mv</code> moves or renames files.", task: "Rename <code>readme_copy.txt</code> to <code>document.txt</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs) => fs.resolvePath('document.txt') !== null && fs.resolvePath('readme_copy.txt') === null },
    { id: "4.3", title: "Chapter 4: rm - Deleting", description: "rm command.", text: "<code>rm</code> permanently deletes files.", task: "Delete the <code>document.txt</code> file.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs) => fs.resolvePath('document.txt') === null },
    { id: "5.1", title: "Chapter 5: help and type", description: "Learning command types.", text: "<code>type</code> displays the type of a command (builtin, alias, file, etc.).", task: "Type <code>type cd</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /^type\s+cd$/.test(cmd) },
    { id: "5.2", title: "Chapter 5: man - Manuals", description: "man command.", text: "<code>man</code> opens reference manual pages for commands.", task: "Type <code>man ls</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /^man\s+ls$/.test(cmd) },
    { id: "6.1", title: "Chapter 6: Redirection >", description: "Standard Output.", text: "<code>></code> redirects standard output to a file.", task: "Type <code>ls > list.txt</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs) => fs.resolvePath('list.txt') !== null },
    { id: "6.2", title: "Chapter 6: Pipes |", description: "Pipeline.", text: "<code>|</code> feeds the standard output of one command as standard input to another command.", task: "Type <code>ls | wc -l</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /ls\s+.*\|\s*wc/.test(cmd) },
    { id: "7.1", title: "Chapter 7: Wildcards *", description: "Wildcards.", text: "<code>*</code> matches any sequence of characters in filenames.", task: "Type <code>ls scripts/*.sh</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /ls\s+scripts\/\*\.sh/.test(cmd) },
    { id: "7.2", title: "Chapter 7: Brace Expansion {}", description: "Brace Expansion.", text: "<code>{a,b}</code> generates multiple string combinations.", task: "Type <code>echo test_{1,2,3}.txt</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /echo\s+.*\{1,2,3\}/.test(cmd) },
    { id: "8.1", title: "Chapter 8: History & Shortcuts", description: "History.", text: "<code>history</code> lists your previously executed commands.", task: "Type <code>history</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /^history(\s+.*)?$/.test(cmd) },
    { id: "9.1", title: "Chapter 9: Permissions", description: "chmod.", text: "<code>chmod</code> modifies file access permissions.", task: "Type <code>chmod 600 notes.txt</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /chmod\s+600\s+notes\.txt/.test(cmd) },
    { id: "10.1", title: "Chapter 10: Processes", description: "ps and top.", text: "<code>ps</code> lists the currently active processes.", task: "Type <code>ps aux</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /ps\s+.*aux/.test(cmd) },

    // --- PART 2: Configuration and Environment ---
    { id: "11.1", title: "Chapter 11: Environment", description: "printenv.", text: "View environment variables with the <code>printenv</code> command.", task: "Type <code>printenv HOME</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /printenv\s+HOME/.test(cmd) },
    { id: "12.1", title: "Chapter 12: Vi Editor", description: "vi editor basics.", text: "<code>vi</code> is a classic text editor on Unix-like operating systems.", task: "Type <code>vi test.txt</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /^vi\s+test\.txt$/.test(cmd) },
    { id: "13.1", title: "Chapter 13: Prompt Customization", description: "PS1 variable.", text: "The <code>PS1</code> environment variable defines your command prompt.", task: "Type <code>export PS1=\"test$ \"</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs, term) => term.env['PS1'] === 'test$ ' },

    // --- PART 3: Common Tasks ---
    { id: "14.1", title: "Chapter 14: Package Management", description: "apt-get.", text: "<code>apt</code> is used to manage software packages (simulated).", task: "Type <code>apt install cowsay</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /apt\s+install\s+cowsay/.test(cmd) },
    { id: "15.1", title: "Chapter 15: Storage", description: "df and du.", text: "Check disk space usage with <code>df</code> and directory space with <code>du</code>.", task: "Type <code>df -h</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /df\s+-h/.test(cmd) },
    { id: "16.1", title: "Chapter 16: Networking", description: "ping.", text: "Test network connection.", task: "Type <code>ping 8.8.8.8</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /ping\s+8\.8\.8\.8/.test(cmd) },
    { id: "17.1", title: "Chapter 17: Searching - find", description: "find command.", text: "<code>find</code> is the most powerful tool to search for files in a directory hierarchy.", task: "Type <code>find . -name \"*.sh\"</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /find\s+\.\s+-name/.test(cmd) },
    { id: "18.1", title: "Chapter 18: Archiving", description: "tar and gzip.", text: "<code>tar</code> groups files into an archive, while <code>gzip</code> compresses them.", task: "Type <code>tar -czf scripts.tar.gz scripts/</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs) => fs.resolvePath('scripts.tar.gz') !== null },
    { id: "19.1", title: "Chapter 19: Text Processing", description: "grep.", text: "Use <code>grep</code> to search for text patterns inside files.", task: "Type <code>grep \"root\" /etc/passwd</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /grep\s+.*\/etc\/passwd/.test(cmd) },
    { id: "20.1", title: "Chapter 20: sed - Text Editing", description: "sed s///g.", text: "<code>sed</code> performs basic text transformations on an input stream (stream editor).", task: "Type <code>echo \"hello world\" | sed 's/hello/hi/'</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /sed\s+.*s\/hello\/hi/.test(cmd) },
    { id: "20.2", title: "Chapter 20: awk - Column Processing", description: "awk '{print $1}'.", text: "<code>awk</code> parses files into fields/columns.", task: "Type <code>awk -F: '{print $1}' /etc/passwd</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /awk\s+.*\$1/.test(cmd) },
    { id: "21.1", title: "Chapter 21: Formatting Output", description: "pr.", text: "Format text for printing.", task: "Type <code>pr file.txt</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /pr\s+file\.txt/.test(cmd) },
    { id: "22.1", title: "Chapter 22: Printing", description: "lpr.", text: "Send files to printer.", task: "Type <code>lpr file.txt</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /lpr\s+file\.txt/.test(cmd) },
    { id: "23.1", title: "Chapter 23: Compiling Programs", description: "make.", text: "Build automation tool.", task: "Type <code>make</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /^make(\s+.*)?$/.test(cmd) },

    // --- PART 4: Script Writing ---
    { id: "24.1", title: "Chapter 24: First Script", description: "Shebang #!.", text: "Scripts start with a shebang line pointing to the shell interpreter.", task: "Type <code>bash scripts/hello.sh</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/hello\.sh/.test(cmd) },
    { id: "25.1", title: "Chapter 25: Variables", description: "Assigning variables.", text: "Assign variables using the syntax <code>VAR=value</code> without spaces.", task: "Type <code>MSG=\"Hello\"; echo $MSG</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs, term) => term.env['MSG'] === 'Hello' },
    { id: "26.1", title: "Chapter 26: HERE Documents", description: "<< EOF.", text: "HERE documents allow embedding multi-line strings inside a shell script.", task: "Type <code>bash scripts/sys_info_page</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/sys_info_page/.test(cmd) },
    { id: "27.1", title: "Chapter 27: if Controls", description: "if [[ condition ]].", text: "Use <code>if</code> statements to execute conditional commands.", task: "Type <code>bash scripts/test-integer</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/test-integer/.test(cmd) },
    { id: "28.1", title: "Chapter 28: read - Reading Input", description: "read command.", text: "Use the <code>read</code> command to read a line of input from standard input.", task: "Type <code>bash scripts/read-menu</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/read-menu/.test(cmd) },
    { id: "29.1", title: "Chapter 29: while Loops", description: "while [ condition ].", text: "A <code>while</code> loop executes a set of commands as long as a condition is true.", task: "Type <code>bash scripts/while-count</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/while-count/.test(cmd) },
    { id: "30.1", title: "Chapter 30: Shell Debugging", description: "set -x.", text: "To trace execution of shell commands, run <code>set -x</code> to enable xtrace.", task: "Type <code>set -x; bash scripts/hello.sh; set +x</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd, fs, term) => term.xtrace === true || /set\s+-x/.test(cmd) },
    { id: "31.1", title: "Chapter 31: case Branching", description: "case ... esac.", text: "A <code>case</code> statement is a cleaner alternative for multiple conditional branches.", task: "Type <code>bash scripts/case-menu</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/case-menu/.test(cmd) },
    { id: "32.1", title: "Chapter 32: Positional Parameters", description: "$1, $2, $#.", text: "Pass positional parameters to scripts and access them with <code>$1</code>, <code>$2</code>, etc.", task: "Type <code>bash scripts/posit-param 'A' 'B' 'C'</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/posit-param\s+.*'A'/.test(cmd) },
    { id: "33.1", title: "Chapter 33: for Loops", description: "for i in list.", text: "A <code>for</code> loop iterates through a list of items and runs commands for each item.", task: "Type <code>bash scripts/longest-word scripts/*</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/longest-word/.test(cmd) },
    { id: "34.1", title: "Chapter 34: Strings and Numbers", description: "Parameter expansion.", text: "Advanced string and number manipulation techniques.", task: "Type <code>echo ${#USER}</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /echo\s+\$\{#USER\}/.test(cmd) },
    { id: "35.1", title: "Chapter 35: Arrays", description: "declare -a.", text: "Arrays store multiple values inside a single variable name.", task: "Type <code>bash scripts/array-mapfile /etc/passwd</code>.", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /bash\s+scripts\/array-mapfile/.test(cmd) },
    { id: "36.1", title: "Chapter 36: Conclusion", description: "Graduation.", text: "You have successfully completed William Shotts' interactive Linux Command Line training! You are now a Bash expert.", task: "For graduation: <code>echo 'LINUX MASTER'</code>", unlocked: [...baseUnlocked], checkCompletion: (cmd) => /echo\s+.*LINUX MASTER/.test(cmd) }
];

class CourseManager {
    constructor(onLessonComplete) {
        this.lessons = courseData;
        const savedIndex = localStorage.getItem('tlcl_progress_en');
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
            btn.title = 'Copy Code';
            
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
        document.getElementById('progress-text').innerText = `Lesson ${this.currentIndex + 1} / ${this.lessons.length}`;
        
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
                localStorage.setItem('tlcl_progress_en', this.maxUnlockedIndex);
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
                            window.showToast("This lesson is locked. You must complete the previous lessons first!", "error");
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
                localStorage.setItem('tlcl_progress_en', this.maxUnlockedIndex);
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
