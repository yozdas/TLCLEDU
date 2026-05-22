class CommandRegistry {
    constructor() {
        this.commands = {};
        this.registerBuiltins();
    }

    register(name, fn) {
        this.commands[name] = fn;
    }

    execute(cmdName, args, stdin, terminal) {
        if (!this.commands[cmdName]) {
            return { error: `bash: ${cmdName}: command not found` };
        }
        return this.commands[cmdName](args, stdin, terminal, terminal.fs);
    }

    registerBuiltins() {
        this.register('pwd', (args, stdin, term, fs) => {
            return { output: fs.pwd() };
        });

        this.register('date', () => {
            return { output: new Date().toString() };
        });

        this.register('cal', () => {
            const now = new Date();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            return { output: `    ${monthNames[now.getMonth()]} ${now.getFullYear()}\nSu Mo Tu We Th Fr Sa\n                   1\n 2  3  4  5  6  7  8\n 9 10 11 12 13 14 15\n16 17 18 19 20 21 22\n23 24 25 26 27 28 29\n30 31` };
        });

        this.register('ls', (args, stdin, term, fs) => {
            let showHidden = false;
            let longFormat = false;
            let targets = [];
            
            args.forEach(arg => {
                if (arg.startsWith('-')) {
                    if (arg.includes('a')) showHidden = true;
                    if (arg.includes('l')) longFormat = true;
                } else {
                    targets.push(arg);
                }
            });
            
            if (targets.length === 0) targets.push('.');
            
            const results = [];
            targets.forEach(path => {
                const target = fs.resolvePath(path);
                if (!target) {
                    results.push(`ls: cannot access '${path}': No such file or directory`);
                    return;
                }
                
                if (targets.length > 1 && target.type === 'dir') {
                    results.push(`${path}:`);
                }

                if (target.type !== 'dir') {
                    if (longFormat) {
                        const size = target.content ? target.content.length : 0;
                        results.push(`${target.permissions || '-rw-r--r--'} 1 ${target.owner || 'user'} ${target.group || 'user'} ${size} ${target.date || 'Jan 01 00:00'} ${target.name}`);
                    } else {
                        results.push(target.name);
                    }
                    if (targets.length > 1 && target.type === 'dir') results.push(''); 
                    return;
                }
                
                let items = Object.values(target.children);
                if (showHidden) {
                    // Sanal . ve .. girdilerini ekle
                    items.push({ name: '.', type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'user', date: 'Jan 01 00:00' });
                    items.push({ name: '..', type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'user', date: 'Jan 01 00:00' });
                } else {
                    items = items.filter(item => !item.name.startsWith('.'));
                }
                
                items.sort((a, b) => a.name.localeCompare(b.name));

                if (longFormat) {
                    const lines = items.map(item => {
                        const size = item.type === 'dir' ? 4096 : (item.content ? item.content.length : 0);
                        const perms = item.type === 'dir' ? 'd' + (item.permissions || 'rwxr-xr-x').replace(/^d/, '') : '-' + (item.permissions || 'rw-r--r--').replace(/^-/, '');
                        const owner = item.owner || 'user';
                        const group = item.group || 'user';
                        const date = item.date || 'Jan 01 00:00';
                        return `${perms} 1 ${owner} ${group} ${size.toString().padStart(4)} ${date} ${item.name}`;
                    });
                    results.push(lines.join('\n'));
                } else {
                    results.push(items.map(item => item.name).join('  '));
                }
                if (targets.length > 1) results.push('');
            });
            
            return { output: results.join('\n') };
        });

        this.register('cd', (args, stdin, term, fs) => {
            const res = fs.cd(args[0]);
            return res.success ? { output: '' } : { error: res.error };
        });

        this.register('mkdir', (args, stdin, term, fs) => {
            if (args.length === 0) return { error: "mkdir: missing operand" };
            let errors = [];
            args.forEach(arg => {
                const res = fs.mkdir(arg);
                if (!res.success) errors.push(res.error);
            });
            return errors.length > 0 ? { error: errors.join('\n') } : { output: '' };
        });

        this.register('touch', (args, stdin, term, fs) => {
            if (args.length === 0) return { error: "touch: missing file operand" };
            let errors = [];
            args.forEach(arg => {
                const res = fs.touch(arg);
                if (!res.success) errors.push(res.error);
            });
            return errors.length > 0 ? { error: errors.join('\n') } : { output: '' };
        });

        this.register('rm', (args, stdin, term, fs) => {
            if (args.length === 0) return { error: "rm: missing operand" };
            
            let recursive = false;
            let force = false;
            let targets = [];
            
            args.forEach(arg => {
                if (arg.startsWith('-')) {
                    if (arg.includes('r') || arg.includes('R')) recursive = true;
                    if (arg.includes('f')) force = true;
                } else {
                    targets.push(arg);
                }
            });

            if (targets.length === 0) return { error: "rm: missing operand" };

            let errors = [];
            targets.forEach(target => {
                const res = fs.rm(target, { recursive, force });
                if (!res.success) errors.push(res.error);
            });

            if (errors.length > 0) return { error: errors.join('<br>') };
            return { output: '' };
        });

        this.register('cat', (args, stdin, term, fs) => {
            if (args.length === 0) {
                if (stdin !== null) return { output: stdin };
                return { error: "cat: missing operand" };
            }
            const res = fs.readFile(args[0]);
            return res.success ? { output: res.output } : { error: `cat: ${res.error}` };
        });

        this.register('echo', (args, stdin, term, fs) => {
            return { output: args.join(' ') };
        });

        this.register('clear', (args, stdin, term, fs) => {
            term.outputDiv.innerHTML = '';
            return { output: '', noPrint: true };
        });

        this.register('grep', (args, stdin, term, fs) => {
            if (args.length === 0) return { error: "grep: missing operand" };
            const pattern = args[0];
            let textToSearch = stdin;

            if (args.length > 1) { // Read from file
                const res = fs.readFile(args[1]);
                if (!res.success) return { error: `grep: ${res.error}` };
                textToSearch = res.output;
            }

            if (textToSearch === null || textToSearch === undefined) return { output: '' };
            
            try {
                const regex = new RegExp(pattern);
                const lines = textToSearch.split('\n');
                const matched = lines.filter(line => regex.test(line));
                return { output: matched.join('\n') };
            } catch (e) {
                return { error: `grep: invalid regular expression: ${pattern}` };
            }
        });

        this.register('tee', (args, stdin, term, fs) => {
            if (!stdin) return { output: '' };
            if (args.length > 0) {
                fs.writeFile(args[0], stdin);
            }
            return { output: stdin };
        });

        this.register('egrep', (args, stdin, term, fs) => this.commands.grep(args, stdin, term, fs));

        this.register('wc', (args, stdin, term, fs) => {
            let text = stdin;
            let filename = '';
            let showLines = false, showWords = false, showChars = false;
            let fileTarget = null;

            args.forEach(arg => {
                if (arg.startsWith('-')) {
                    if (arg.includes('l')) showLines = true;
                    if (arg.includes('w')) showWords = true;
                    if (arg.includes('c') || arg.includes('m')) showChars = true;
                } else {
                    fileTarget = arg;
                }
            });

            // Default behavior if no flags
            if (!showLines && !showWords && !showChars) {
                showLines = true;
                showWords = true;
                showChars = true;
            }

            if (fileTarget) {
                const res = fs.readFile(fileTarget);
                if (!res.success) return { error: `wc: ${res.error}` };
                text = res.output;
                filename = ' ' + fileTarget;
            }
            if (text === null || text === undefined) text = '';
            
            const linesCount = text === '' ? 0 : text.split('\n').length;
            const wordsCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            const charsCount = text.length;

            let resultParts = [];
            if (showLines) resultParts.push(linesCount);
            if (showWords) resultParts.push(wordsCount);
            if (showChars) resultParts.push(charsCount);

            return { output: `${resultParts.join(' ')}${filename}` };
        });

        this.register('sort', (args, stdin, term, fs) => {
            const file = args[args.length - 1];
            let input = stdin;
            if (!input && file && !file.startsWith('-')) {
                const res = fs.readFile(file);
                if (!res.success) return { error: `sort: ${res.error}` };
                input = res.output;
            }
            if (!input) return { output: '' };
            const lines = input.split('\n').filter(l => l.trim() !== '');
            return { output: lines.sort().join('\n') };
        });

        this.register('uniq', (args, stdin, term, fs) => {
            const input = stdin || '';
            if (!input) return { output: '' };
            const lines = input.split('\n');
            const result = [];
            for (let i = 0; i < lines.length; i++) {
                if (lines[i] !== lines[i - 1]) result.push(lines[i]);
            }
            return { output: result.join('\n') };
        });

        this.register('cp', (args, stdin, term, fs) => {
            if (args.length < 2) return { error: "cp: missing file operand" };
            const res = fs.cp(args[0], args[1]);
            return res.success ? { output: '' } : { error: res.error };
        });

        this.register('mv', (args, stdin, term, fs) => {
            if (args.length < 2) return { error: "mv: missing file operand" };
            const res = fs.mv(args[0], args[1]);
            return res.success ? { output: '' } : { error: res.error };
        });

        this.register('ln', (args, stdin, term, fs) => {
            if (args.length < 2) return { error: "ln: missing file operand" };
            let symbolic = args.includes('-s');
            const target = symbolic ? args[args.indexOf('-s') + 1] : args[0];
            const link = symbolic ? args[args.indexOf('-s') + 2] : args[1];
            
            if (!target || !link) return { error: "ln: missing file operand" };
            
            // Simülasyonda linkler aslında kopyadır ama farklı isimle
            const res = fs.cp(target, link);
            return res.success ? { output: '' } : { error: res.error };
        });

        this.register('head', (args, stdin, term, fs) => {
            let text = stdin;
            let n = 10;
            let fileTarget = null;

            args.forEach((arg, index) => {
                if (arg === '-n' && args[index+1]) n = parseInt(args[index+1]);
                else if (arg.startsWith('-n')) n = parseInt(arg.substring(2));
                else if (!arg.startsWith('-')) fileTarget = arg;
            });

            if (fileTarget) {
                const res = fs.readFile(fileTarget);
                if (!res.success) return { error: `head: ${res.error}` };
                text = res.output;
            }

            if (text === null || text === undefined) return { error: "head: missing operand" };
            const lines = text.split('\n');
            return { output: lines.slice(0, n).join('\n') };
        });

        this.register('tail', (args, stdin, term, fs) => {
            let text = stdin;
            let n = 10;
            let fileTarget = null;

            args.forEach((arg, index) => {
                if (arg === '-n' && args[index+1]) n = parseInt(args[index+1]);
                else if (arg.startsWith('-n')) n = parseInt(arg.substring(2));
                else if (!arg.startsWith('-')) fileTarget = arg;
            });

            if (fileTarget) {
                const res = fs.readFile(fileTarget);
                if (!res.success) return { error: `tail: ${res.error}` };
                text = res.output;
            }

            if (text === null || text === undefined) return { error: "tail: missing operand" };
            const lines = text.split('\n');
            return { output: lines.slice(-n).join('\n') };
        });

        this.register('whoami', (args, stdin, term) => {
            return { output: term.env.USER || 'user' };
        });

        this.register('id', (args, stdin, term) => {
            const username = term.env.USER || 'user';
            return { output: `uid=1000(${username}) gid=1000(${username}) groups=1000(${username})` };
        });

        this.register('chmod', (args, stdin, term, fs) => {
            if (args.length < 2) return { error: "chmod: missing operand" };
            const mode = args[0];
            const targetPath = args[1];
            const target = fs.resolvePath(targetPath);
            if (!target) return { error: `chmod: cannot access '${targetPath}': No such file or directory` };
            
            const mapOctal = { '7': 'rwx', '6': 'rw-', '5': 'r-x', '4': 'r--', '0': '---' };
            
            if (mode === '+x') {
                // Add 'x' to owner, group, and others if they have 'r'
                let p = target.permissions || 'rw-r--r--';
                let pArr = p.split('');
                pArr[2] = 'x';
                pArr[5] = 'x';
                pArr[8] = 'x';
                target.permissions = pArr.join('');
                fs.saveState();
                return { output: '' };
            }

            if (mode.length === 3 && mapOctal[mode[0]]) {
                let pStr = '';
                for(let i=0; i<3; i++) pStr += mapOctal[mode[i]] || '---';
                target.permissions = pStr;
                fs.saveState();
                return { output: '' };
            }
            return { error: `chmod: invalid mode: '${mode}' (Desteklenen: octal örn 755 veya sembolik +x)` };
        });

        this.register('chown', (args, stdin, term, fs) => {
            if (args.length < 2) return { error: "chown: missing operand" };
            const owner = args[0];
            const targetPath = args[1];
            const target = fs.resolvePath(targetPath);
            if (!target) return { error: `chown: cannot access '${targetPath}': No such file or directory` };
            
            target.owner = owner;
            fs.saveState();
            return { output: '' };
        });

        this.register('ps', (args, stdin, term, fs) => {
            const processes = window.processManager.getProcesses();
            let output = "  PID TTY          TIME CMD\n";
            processes.forEach(p => {
                output += `${p.pid.toString().padStart(5)} ?        00:00:00 ${p.name}\n`;
            });
            return { output: output.trim() };
        });

        this.register('kill', (args, stdin, term, fs) => {
            if (args.length === 0) return { error: "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]" };
            const pid = args[0];
            const result = window.processManager.killProcess(pid);
            if (result.error) return { error: result.error };
            return { output: "" };
        });

        this.register('top', (args, stdin, term, fs) => {
            const processes = window.processManager.getProcesses();
            let output = "PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n";
            processes.forEach(p => {
                output += `${p.pid.toString().padStart(4)} ${p.user.padEnd(8)} 20   0  162452  32512   9124 R   ${p.cpu.toString().padStart(4)}   ${p.mem.toString().padStart(4)}   0:00.01 ${p.name}\n`;
            });
            return { output: output.trim() };
        });

        this.register('printenv', (args, stdin, term, fs) => {
            let output = '';
            for (const key of Object.keys(term.env)) {
                output += `${key}=${term.env[key]}\n`;
            }
            return { output: output.trim() };
        });

        this.register('export', (args, stdin, term, fs) => {
            if (args.length === 0) {
                let output = '';
                for (const key of Object.keys(term.env)) {
                    output += `declare -x ${key}="${term.env[key]}"\n`;
                }
                return { output: output.trim() };
            }
            const [key, value] = args[0].split('=');
            if (key) {
                term.env[key] = value || '';
                return { output: '' };
            }
            return { error: 'export: usage: export name[=value] ...' };
        });

        this.register('alias', (args, stdin, term, fs) => {
            if (args.length === 0) {
                let output = '';
                for (const key of Object.keys(term.aliases)) {
                    output += `alias ${key}='${term.aliases[key]}'\n`;
                }
                return { output: output.trim() };
            }
            const part = args.join(' ');
            const match = part.match(/([^=]+)=['"]?([^'"]+)['"]?/);
            if (match) {
                term.aliases[match[1].trim()] = match[2].trim();
                return { output: '' };
            }
            return { error: 'alias: usage: alias name=value' };
        });

        this.register('history', (args, stdin, term, fs) => {
            let output = '';
            term.history.forEach((cmd, i) => {
                output += `${(i + 1).toString().padStart(5)}  ${cmd}\n`;
            });
            return { output: output.trim() };
        });

        this.register('vi', (args, stdin, term, fs) => {
            if (args.length === 0) {
                return { error: 'vi: usage: vi filename' };
            }
            const filename = args[0];
            let content = '';
            const readRes = fs.readFile(filename);
            if (readRes.success) {
                content = readRes.output;
            }
            
            if (term.vim) {
                term.vim.open(filename, content);
                return { output: '', silent: true };
            }
            return { error: 'vi: editor not initialized' };
        });

        this.register('apt', (args, stdin, term, fs) => {
            const sub = args[0];
            if (sub === 'update') {
                return { output: 'Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease\nReading package lists... Done' };
            }
            if (sub === 'install') {
                const pkg = args[1];
                if (!pkg) return { error: 'apt: package name required' };
                if (pkg === 'cowsay') {
                    term.installedPackages.add('cowsay');
                    return { output: 'Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  cowsay\n0 upgraded, 1 newly installed, 0 to remove.\nSetting up cowsay (3.03-17)... Done' };
                }
                return { error: `E: Unable to locate package ${pkg}` };
            }
            return { output: 'apt 1.0.1 (amd64)\nUsage: apt install [package]' };
        });

        this.register('cowsay', (args, stdin, term, fs) => {
            if (!term.installedPackages.has('cowsay')) {
                return { error: 'cowsay: command not found (try: apt install cowsay)' };
            }
            const msg = args.join(' ') || (stdin ? stdin : 'Mööö!');
            const line = '-'.repeat(msg.length + 2);
            const cow = `
 < ${msg} >
 ${line}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
            `;
            return { output: cow };
        });

        this.register('df', (args, stdin, term, fs) => {
            let humanReadable = args.some(arg => arg.includes('h'));
            const output = [
                "Filesystem      Size  Used Avail Use% Mounted on",
                `/dev/sda1       ${humanReadable ? '20G' : '20971520'}  ${humanReadable ? '8.4G' : '8808038'}  ${humanReadable ? '11G' : '11534336'}  44% /`,
                `tmpfs           ${humanReadable ? '1.6G' : '1677721'}  ${humanReadable ? '0B' : '0'}  ${humanReadable ? '1.6G' : '1677721'}   0% /dev/shm`
            ];
            return { output: output.join('\n') };
        });

        this.register('du', (args, stdin, term, fs) => {
            let humanReadable = false;
            let summary = false;
            let paths = [];
            
            args.forEach(arg => {
                if (arg.startsWith('-') && arg.length > 1) {
                    if (arg.includes('h')) humanReadable = true;
                    if (arg.includes('s')) summary = true;
                } else {
                    paths.push(arg);
                }
            });
            
            const path = paths[0] || '.';
            const target = fs.resolvePath(path);
            if (!target) return { error: `du: cannot access '${path}': No such file or directory` };

            const getDirSize = (node) => {
                if (node.type !== 'dir') return node.content ? node.content.length : 0;
                return Object.values(node.children).reduce((acc, child) => acc + getDirSize(child), 4096);
            };

            const formatSize = (size) => {
                if (!humanReadable) return Math.ceil(size / 1024);
                if (size < 1024) return size + 'B';
                if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'K';
                return (size / (1024 * 1024)).toFixed(1) + 'M';
            };

            if (summary || target.type !== 'dir') {
                return { output: `${formatSize(getDirSize(target))}\t${path}` };
            }

            const results = [];
            Object.values(target.children).forEach(child => {
                results.push(`${formatSize(getDirSize(child))}\t${path === '/' ? '' : (path === '.' ? '' : path + '/')}${child.name}`);
            });
            results.push(`${formatSize(getDirSize(target))}\t${path}`);
            return { output: results.join('\n') };
        });

        this.register('type', (args, stdin, term, fs) => {
            const cmd = args[0];
            if (!cmd) return { error: 'type: missing operand' };
            const exists = this.commands[cmd];
            if (exists) {
                if (['cd', 'pwd', 'echo', 'alias', 'export'].includes(cmd)) {
                    return { output: `${cmd} is a shell builtin` };
                }
                return { output: `${cmd} is /bin/${cmd}` };
            }
            return { error: `type: ${cmd}: not found` };
        });

        this.register('which', (args, stdin, term, fs) => {
            const cmd = args[0];
            if (!cmd) return { output: '' };
            const builtins = ['cd', 'pwd', 'echo', 'alias', 'export', 'printenv'];
            if (builtins.includes(cmd)) return { output: '' };
            if (this.commands[cmd]) return { output: `/bin/${cmd}` };
            return { output: '' };
        });

        this.register('man', (args, stdin, term, fs) => {
            const cmd = args[0];
            if (!cmd) return { error: 'What manual page do you want?' };
            const manuals = {
                'ls': 'LS(1) - list directory contents',
                'pwd': 'PWD(1) - print name of current/working directory',
                'cd': 'CD(1) - change the working directory',
                'cp': 'CP(1) - copy files and directories',
                'mv': 'MV(1) - move (rename) files',
                'rm': 'RM(1) - remove files or directories',
                'grep': 'GREP(1) - print lines that match patterns',
                'date': 'DATE(1) - print or set the system date and time',
                'cal': 'CAL(1) - display a calendar',
                'file': 'FILE(1) - determine file type',
                'less': 'LESS(1) - opposite of more',
                'free': 'FREE(1) - display amount of free and used memory in the system',
                'ln': 'LN(1) - make links between files',
                'tee': 'TEE(1) - read from standard input and write to standard output and files',
                'alias': 'ALIAS(1) - define or display aliases',
                'unalias': 'UNALIAS(1) - remove alias definitions'
            };
            return { output: manuals[cmd] || `No manual entry for ${cmd}` };
        });

        this.register('apropos', (args) => {
            if (!args[0]) return { error: 'apropos: what?' };
            return { output: `${args[0]} (1) - manual page found (mocked)` };
        });

        this.register('whatis', (args) => {
            if (!args[0]) return { error: 'whatis: what?' };
            return { output: `${args[0]} (1) - short description (mocked)` };
        });

        this.register('info', (args) => {
            if (!args[0]) return { output: 'Main Info Menu - Welcome to GNU Info.' };
            return { output: `File: ${args[0]},  Node: Top,  Up: (dir)\n\nThis is a mocked info page for ${args[0]}.` };
        });

        this.register('file', (args, stdin, term, fs) => {
            if (!args[0]) return { error: 'file: missing operand' };
            const target = fs.resolvePath(args[0]);
            if (!target) return { error: `file: cannot open '${args[0]}' (No such file or directory)` };
            if (target.type === 'dir') return { output: `${args[0]}: directory` };
            if (target.name.endsWith('.sh') || (target.content && target.content.startsWith('#!'))) return { output: `${args[0]}: POSIX shell script, ASCII text executable` };
            return { output: `${args[0]}: ASCII text` };
        });

        this.register('less', (args, stdin, term, fs) => this.commands.cat(args, stdin, term, fs));

        this.register('free', (args) => {
            let humanReadable = args.some(arg => arg.includes('h') || arg.includes('m'));
            return { output: `              total        used        free      shared  buff/cache   available\nMem:      ${humanReadable ? '15Gi' : '16384000'}  ${humanReadable ? '4.2Gi' : '4404019'}  ${humanReadable ? '8.1Gi' : '8493465'}   ${humanReadable ? '1.2Gi' : '1258291'}  ${humanReadable ? '2.7Gi' : '2831155'}   ${humanReadable ? '10Gi' : '10485760'}\nSwap:     ${humanReadable ? '2.0Gi' : '2097152'}  ${humanReadable ? '0B' : '0'}  ${humanReadable ? '2.0Gi' : '2097152'}` };
        });

        this.register('cut', (args, stdin, term, fs) => {
            const file = args[args.length - 1];
            const readRes = file && !file.startsWith('-') ? fs.readFile(file) : null;
            const input = stdin || (readRes && readRes.success ? readRes.output : '');
            if (!input) return { output: '' };

            let field = 1;
            const fIdx = args.indexOf('-f');
            if (fIdx !== -1) field = parseInt(args[fIdx + 1]);

            const lines = input.split('\n');
            const result = lines.map(line => {
                const parts = line.split(/[ \t]+/);
                return parts[field - 1] || '';
            });
            return { output: result.join('\n') };
        });

        this.register('nl', (args, stdin, term, fs) => {
            const file = args[0];
            const readRes = file ? fs.readFile(file) : null;
            const input = stdin || (readRes && readRes.success ? readRes.output : '');
            if (!input) return { output: '' };
            const lines = input.split('\n');
            const result = lines.map((line, i) => `    ${i + 1}  ${line}`);
            return { output: result.join('\n') };
        });

        this.register('bash', (args, stdin, term, fs) => {
            const file = args[0];
            if (!file) return { output: 'GNU bash, version 5.1.16(1)-release' };
            const target = fs.readFile(file);
            if (!target.success) return { error: `bash: ${file}: No such file or directory` };
            
            const lines = target.output.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#'));
            term.printLine(`<span style="color: var(--accent)">[bash] Running ${file}...</span>`);
            
            // Execute each line
            for (const line of lines) {
                // If the line is another bash command for the same file, skip to avoid loop
                if (line.includes(`bash ${file}`)) continue;
                term.processCommand(line);
            }
            
            return { output: `<span style="color: var(--success)">[bash] ${file} execution finished.</span>` };
        });

        this.register('sh', (args, stdin, term, fs) => this.commands.bash(args, stdin, term, fs));

        this.register('read', (args, stdin, term, fs) => {
            let promptText = 'Input: ';
            const pIdx = args.indexOf('-p');
            if (pIdx !== -1) promptText = args[pIdx + 1];
            
            const input = window.prompt(promptText);
            return { output: input || '' };
        });

        this.register('sudo', (args, stdin, term, fs) => {
            if (args.length === 0) return { output: 'usage: sudo -h | -K | -k | -V | -v | -- [command]' };
            term.printLine(`[sudo] password for user: `);
            return { output: `Executing: ${args.join(' ')}\n(Mock: Permission granted)` };
        });

        this.register('gcc', (args, stdin, term, fs) => {
            return { output: 'gcc: no errors found. Compilation successful.' };
        });

        this.register('make', (args, stdin, term, fs) => {
            return { output: 'gcc -c main.c\ngcc -o app main.o\nDone.' };
        });

        this.register('lpr', (args, stdin, term, fs) => {
            return { output: `Request ${Math.floor(Math.random() * 1000)} queued.` };
        });

        this.register('lpq', (args, stdin, term, fs) => {
            return { output: 'Rank    Owner   Job     File(s)                         Total Size\nactive  user    123     readme.txt                      1024 bytes' };
        });

        this.register('uptime', () => ({
            output: ` 09:00:00 up 10 days,  2:30,  1 user,  load average: 0.05, 0.02, 0.01`
        }));

        this.register('ping', (args) => {
            if (!args[0]) return { error: 'usage: ping [-c count] destination' };
            return { output: `PING ${args[0]} (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.045 ms\n64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.052 ms\n--- ${args[0]} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss` };
        });

        this.register('ifconfig', () => ({
            output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 172.17.0.2  netmask 255.255.0.0  broadcast 172.17.255.255\n        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        loop back  txqueuelen 1000  (Local Loopback)`
        }));

        this.register('ip', (args) => {
            if (args[0] === 'addr') return this.commands.ifconfig();
            return { output: 'usage: ip [ OPTIONS ] OBJECT { COMMAND | help }' };
        });

        this.register('wget', (args) => {
            if (!args[0]) return { error: 'wget: missing URL' };
            return { output: `--2024-05-14 09:00:00--  ${args[0]}\nResolving ${args[0]}... 127.0.0.1\nConnecting to ${args[0]}|127.0.0.1|:80... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1024 (1.0K) [text/html]\nSaving to: 'index.html'\n\n2024-05-14 09:00:00 (1.2 MB/s) - 'index.html' saved [1024/1024]` };
        });

        this.register('locate', (args, stdin, term) => {
            if (!args[0]) return { error: 'locate: no pattern specified' };
            const username = term.env.USER || 'user';
            return { output: `/usr/bin/${args[0]}\n/home/${username}/docs/${args[0]}.txt` };
        });

        this.register('stat', (args, stdin, term, fs) => {
            const file = args[args.length - 1];
            if (!file) return { error: 'stat: missing operand' };
            const username = term.env.USER || 'user';
            const paddedUser = username.padEnd(4);
            return { output: `  File: ${file}\n  Size: 1024       Blocks: 8          IO Block: 4096   regular file\nDevice: 802h/2050d  Inode: 1234567     Links: 1\nAccess: (0644/-rw-r--r--)  Uid: ( 1000/    ${paddedUser})   Gid: ( 1000/    ${paddedUser})` };
        });

        this.register('mapfile', (args, stdin, term, fs) => {
            // Usage: mapfile -t words < "$WORDLIST" (Simplified mock)
            let file = args[args.length - 1];
            // If it's a redirection like < file, the shell already handles it? 
            // In our mock scripts, it's often 'mapfile -t array < file'
            const res = fs.readFile(file);
            if (!res.success) return { error: `mapfile: ${file}: No such file` };
            
            const arrayName = args[args.indexOf('-t') + 1] || 'MAPFILE';
            term.env[arrayName] = res.output; // Store raw for now, our shell handles ${array[idx]}
            return { output: '', noPrint: true };
        });

        this.register('bc', (args, stdin, term, fs) => {
            if (!stdin) return { output: '' };
            try {
                let clean = stdin.replace(/scale\s*=\s*\d+/g, '')
                                 .replace(/print/g, '')
                                 .replace(/\^/g, '**')
                                 .replace(/;/g, '\n')
                                 .trim();
                
                if (clean.includes('t +=') || clean.includes('t /')) {
                    const lines = clean.split('\n');
                    let t = 0;
                    lines.forEach(l => {
                        if (l.includes('t += ')) t += parseFloat(l.split('+=')[1]);
                    });
                    const lastLine = lines[lines.length - 1];
                    if (lastLine.includes('t /')) {
                        const div = parseFloat(lastLine.split('/')[1]);
                        return { output: (t / (div || 1)).toFixed(2) };
                    }
                    return { output: t.toString() };
                }
                
                // Evaluate the expression
                const result = eval(clean);
                return { output: result !== undefined ? result.toString() : '' };
            } catch(e) { return { output: '0' }; }
        });

        this.register('strings', (args, stdin, term, fs) => {
            const file = args[0];
            if (!file) return { error: 'strings: missing operand' };
            const node = fs.resolvePath(file);
            if (!node || node.type !== 'file') return { error: `strings: ${file}: No such file` };
            return { output: node.content.split(/\s+/).filter(s => s.length > 3).join('\n') };
        });

        this.register('find', (args, stdin, term, fs) => {
            let path = '.';
            if (args[0] && !args[0].startsWith('-')) {
                path = args[0];
            }
            const target = fs.resolvePath(path);
            if (!target) return { error: `find: '${path}': No such file or directory` };
            
            const results = [];
            const traverse = (node, currentPath) => {
                results.push({ path: currentPath, node: node });
                if (node.type === 'dir') {
                    for (let name in node.children) {
                        traverse(node.children[name], (currentPath === '/' ? '' : currentPath) + '/' + name);
                    }
                }
            };
            traverse(target, path === '.' ? fs.pwd() : path);
            
            let filtered = results;

            // -type f/d
            const typeIdx = args.indexOf('-type');
            if (typeIdx !== -1) {
                const type = args[typeIdx + 1];
                filtered = filtered.filter(item => {
                    if (type === 'f') return item.node.type === 'file';
                    if (type === 'd') return item.node.type === 'dir';
                    return true;
                });
            }

            // -name
            const nameIdx = args.indexOf('-name');
            if (nameIdx !== -1) {
                let pattern = args[nameIdx + 1].replace(/"/g, '').replace(/'/g, '');
                pattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
                const regex = new RegExp('^' + pattern + '$');
                filtered = filtered.filter(item => regex.test(item.node.name));
            }
            
            // Unsupported flags check
            const unsupported = args.filter(a => a.startsWith('-') && !['-type', '-name'].includes(a));
            if (unsupported.length > 0) {
                term.printLine(`<span style="color: var(--text-muted)">[Bilgi] find: '${unsupported[0]}' özelliği henüz simüle edilmedi, ancak temel arama devam ediyor...</span>`);
            }
            
            return { output: filtered.length > 0 ? filtered.map(f => f.path).join('\n') : '' };
        });

        this.register('tar', (args) => {
            if (args.includes('c') || args.includes('-c')) return { output: 'tar: Archive created successfully.' };
            if (args.includes('x') || args.includes('-x')) return { output: 'tar: Archive extracted successfully.' };
            return { output: 'tar: [options] [archive] [files...]' };
        });

        this.register('gzip', (args) => ({ output: `gzip: ${args[0]} compressed.` }));
        this.register('gunzip', (args) => ({ output: `gunzip: ${args[0]} decompressed.` }));

        this.register('paste', () => ({ output: 'Mock: Files pasted side-by-side.' }));
        this.register('join', () => ({ output: 'Mock: Files joined on common field.' }));
        this.register('tr', (args) => ({ output: `Mock: Character translation performed with ${args.join(' ')}` }));
        this.register('sed', (args) => ({ output: `Mock: Stream editing finished: ${args.join(' ')}` }));
        this.register('awk', (args) => ({ output: `Mock: Pattern scanning and processing finished: ${args.join(' ')}` }));
        this.register('printf', (args) => ({ output: args.join(' ') }));
        this.register('fmt', (args, stdin) => ({ output: stdin || 'Mock: Text formatted.' }));
        this.register('lprm', (args) => ({ output: `Job ${args[0]} removed from queue.` }));
        this.register('lpr', (args) => {
            return { output: args.length > 0 ? `lpr: Printing '${args[0]}'...` : 'lpr: no files specified.' };
        });

        this.register('lpq', () => {
            return { output: 'Printer queue: [Empty]\nRank  Owner      Job  File(s)                         Total Size\n1st   user       124  (stdin)                         1024 bytes' };
        });

        this.register('gcc', (args) => {
            if (args.length === 0) return { error: 'gcc: fatal error: no input files' };
            return { output: 'gcc: compiling...\ngcc: linking...\na.out created.' };
        });

        this.register('make', (args) => {
            return { output: 'make: Entering directory \'/home/user\'\ngcc -c main.c\ngcc -o app main.o\nmake: Leaving directory \'/home/user\'' };
        });

        this.register('alias', (args, stdin, term) => {
            if (args.length === 0) {
                const aliases = [];
                for (const key of Object.keys(term.env)) {
                    if (key.startsWith('alias_')) {
                        aliases.push(`alias ${key.substring(6)}='${term.env[key]}'`);
                    }
                }
                return { output: aliases.join('\n') };
            }
            const match = args[0].match(/^([a-zA-Z0-9_]+)=(.*)$/);
            if (match) {
                const name = match[1];
                let value = match[2];
                if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                    value = value.substring(1, value.length - 1);
                }
                term.env['alias_' + name] = value;
                return { output: '' };
            }
            return { output: '' };
        });

        this.register('unalias', (args, stdin, term, fs) => {
            if (args.length === 0) return { error: 'unalias: usage: unalias name [name ...]' };
            args.forEach(name => {
                delete term.aliases[name];
            });
            return { output: '' };
        });

        this.register('set', (args, stdin, term) => {
            if (args.includes('-x')) term.xtrace = true;
            if (args.includes('+x')) term.xtrace = false;
            return { output: '' };
        });

        this.register('vi', (args, stdin, term) => {
            if (args.length === 0) return { error: 'vi: filename required' };
            if (!term.vim) return { error: 'vi: vim editor not initialized' };
            
            const filename = args[0];
            const file = term.fs.resolvePath(filename);
            const content = file ? file.content : '';
            
            term.vim.open(filename, content);
            return { output: '', noPrint: true };
        });

        this.register('sed', (args, stdin, term, fs) => {
            if (args.length === 0) return { error: 'sed: usage: sed expression [file]' };
            
            let expr = args[0];
            let input = stdin || '';
            let filePath = args[1];
            
            if (filePath) {
                const file = fs.resolvePath(filePath);
                if (file) input = file.content;
                else return { error: `sed: ${filePath}: No such file or directory` };
            }
            
            if (!input) return { output: '' };
            
            const lines = input.split('\n');
            let results = [];
            
            // Basic s/pattern/replacement/flags
            if (expr.startsWith('s/')) {
                const parts = expr.split('/');
                const pattern = parts[1];
                const replacement = parts[2];
                const flags = parts[3] || '';
                const isGlobal = flags.includes('g');
                
                results = lines.map(line => {
                    if (isGlobal) return line.split(pattern).join(replacement);
                    return line.replace(pattern, replacement);
                });
            } else if (expr === 'd') {
                // Delete all lines (simple simulation)
                return { output: '' };
            } else if (expr.match(/^\d+d$/)) {
                // Delete specific line: '1d'
                const lineNum = parseInt(expr);
                results = lines.filter((_, idx) => idx + 1 !== lineNum);
            } else {
                return { output: input }; // Passthrough if not recognized
            }
            
            return { output: results.join('\n') };
        });

        this.register('awk', (args, stdin, term, fs) => {
            if (args.length === 0) return { error: 'awk: usage: awk [-F delimiter] \'{print $1}\' [file]' };
            
            let delimiter = /[ \t]+/;
            let program = '';
            let filePath = '';
            
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '-F') {
                    delimiter = args[i+1];
                    i++;
                } else if (args[i].startsWith('{')) {
                    program = args[i];
                } else {
                    filePath = args[i];
                }
            }
            
            let input = stdin || '';
            if (filePath) {
                const file = fs.resolvePath(filePath);
                if (file) input = file.content;
            }
            
            if (!input) return { output: '' };
            
            const lines = input.split('\n');
            const results = lines.map((line, idx) => {
                const fields = line.trim().split(delimiter);
                const NR = idx + 1;
                const NF = fields.length;
                
                if (program.includes('print')) {
                    // Extract $1, $2...
                    let output = program.match(/print\s+(.*)/)[1].replace(/}/, '').trim();
                    const parts = output.split(',').map(p => p.trim());
                    
                    return parts.map(p => {
                        if (p.startsWith('$')) {
                            const n = parseInt(p.substring(1));
                            if (n === 0) return line;
                            return fields[n-1] || '';
                        }
                        if (p === 'NR') return NR;
                        if (p === 'NF') return NF;
                        return p.replace(/['"]/g, '');
                    }).join(' ');
                }
                return line;
            });
            
            return { output: results.join('\n') };
        });

        this.register('tr', (args, stdin, term, fs) => {
            if (args.length === 0) return { error: 'tr: usage: tr [options] set1 [set2]' };
            
            let deleteMode = args.includes('-d');
            let squeezeMode = args.includes('-s');
            let set1 = args.find(a => !a.startsWith('-'));
            let set2 = args.slice(args.indexOf(set1) + 1).find(a => !a.startsWith('-'));
            
            let input = stdin || '';
            if (!input) return { output: '' };

            if (deleteMode) {
                const chars = set1.split('');
                return { output: input.split('').filter(c => !chars.includes(c)).join('') };
            }
            
            if (set1 && set2) {
                // Simple mapping: 'a-z' 'A-Z'
                if (set1 === 'a-z' && set2 === 'A-Z') return { output: input.toUpperCase() };
                if (set1 === 'A-Z' && set2 === 'a-z') return { output: input.toLowerCase() };
                
                const map = {};
                for (let i = 0; i < Math.min(set1.length, set2.length); i++) {
                    map[set1[i]] = set2[i];
                }
                return { output: input.split('').map(c => map[c] || c).join('') };
            }
            
            return { output: input };
        });

        this.register('cut', (args, stdin, term, fs) => {
            let delimiter = '\t';
            let fields = null;
            let characters = null;
            let filePath = '';

            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                if (arg[0] !== '-') {
                    filePath = arg;
                    continue;
                }

                const flag = arg[1];
                if (flag === 'd') {
                    delimiter = arg.substring(2) || args[++i];
                } else if (flag === 'f') {
                    fields = (arg.substring(2) || args[++i]).split(',').map(n => parseInt(n));
                } else if (flag === 'c') {
                    characters = arg.substring(2) || args[++i];
                }
            }

            let input = stdin || '';
            if (filePath) {
                const file = fs.resolvePath(filePath);
                if (file) input = file.content;
            }
            
            if (!input) return { output: '' };
            const lines = input.split('\n');
            
            const results = lines.map(line => {
                if (fields) {
                    const parts = line.split(delimiter);
                    return fields.map(f => parts[f-1] || '').join(delimiter);
                }
                if (characters) {
                    // Simple range 1-5
                    const range = characters.split('-').map(n => parseInt(n));
                    if (range.length === 2) return line.substring(range[0]-1, range[1]);
                    return line[parseInt(characters)-1] || '';
                }
                return line;
            });
            
            return { output: results.join('\n') };
        });

        this.register('printf', (args, stdin, term, fs) => {
            if (args.length === 0) return { error: 'printf: usage: printf format [arguments]' };
            
            let format = args[0];
            let values = args.slice(1);
            
            // Basic printf simulation
            // Replace \n, \t
            format = format.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
            
            let result = format;
            let valIdx = 0;
            
            // %s, %d, %f, and padding %-10s
            result = result.replace(/%([-0-9.]*)([sdf])/g, (match, pad, type) => {
                let val = values[valIdx++] || '';
                if (type === 'd') val = parseInt(val) || 0;
                if (type === 'f') val = parseFloat(val).toFixed(2);
                
                if (pad) {
                    const width = Math.abs(parseInt(pad));
                    const isLeft = pad.startsWith('-');
                    val = val.toString();
                    if (isLeft) return val.padEnd(width);
                    return val.padStart(width);
                }
                return val;
            });
            
            return { output: result };
        });

        this.register('getopts', (args, stdin, term) => {
            if (args.length < 2) return { error: 'getopts: usage: getopts optstring name' };
            
            const optstring = args[0];
            const varName = args[1];
            
            // OPTIND tracks current argument index
            let optind = parseInt(term.env['OPTIND']) || 1;
            // Script arguments start from $1
            const scriptArgs = [];
            for (let i = 1; i <= (parseInt(term.env['#']) || 0); i++) {
                scriptArgs.push(term.env[i]);
            }
            
            if (optind > scriptArgs.length) return { output: '', exitCode: 1 };
            
            const currentArg = scriptArgs[optind - 1];
            if (currentArg.startsWith('-')) {
                const opt = currentArg.substring(1, 2);
                if (optstring.includes(opt)) {
                    term.env[varName] = opt;
                    if (optstring.includes(opt + ':')) {
                        // Argument required
                        term.env['OPTARG'] = scriptArgs[optind] || '';
                        term.env['OPTIND'] = optind + 2;
                    } else {
                        term.env['OPTIND'] = optind + 1;
                    }
                    return { output: '' };
                } else {
                    term.env[varName] = '?';
                    term.env['OPTARG'] = opt;
                    term.env['OPTIND'] = optind + 1;
                    return { output: '' };
                }
            }
            
            return { output: '', exitCode: 1 };
        });

        this.register('shift', (args, stdin, term) => {
            const n = parseInt(args[0]) || 1;
            const count = parseInt(term.env['#']) || 0;
            
            for (let i = 1; i <= count; i++) {
                if (i + n <= count) {
                    term.env[i] = term.env[i + n];
                } else {
                    delete term.env[i];
                }
            }
            term.env['#'] = Math.max(0, count - n);
            return { output: '' };
        });

        this.register('basename', (args) => {
            if (args.length === 0) return { error: 'basename: missing operand' };
            const path = args[0];
            const suffix = args[1];
            let base = path.split('/').pop();
            if (suffix && base.endsWith(suffix)) {
                base = base.substring(0, base.length - suffix.length);
            }
            return { output: base };
        });

        this.register('dirname', (args) => {
            if (args.length === 0) return { error: 'dirname: missing operand' };
            const path = args[0];
            const parts = path.split('/');
            if (parts.length === 1) return { output: '.' };
            parts.pop();
            const res = parts.join('/') || '/';
            return { output: res };
        });

        this.register('help', () => ({ output: 'GNU bash, version 5.1.16(1)-release\nThese shell commands are defined internally. Type `help\' to see this list.' }));

        this.register('jobs', (args, stdin, term) => {
            if (!window.processManager) return { error: "Process manager not initialized." };
            const jobs = window.processManager.getJobs();
            return { output: jobs || "No active background processes." };
        });

        this.register('kill', (args, stdin, term) => {
            if (args.length === 0) return { error: "kill: usage: kill [-SIGNAL] PID" };
            let pidStr = args[args.length - 1];
            if (pidStr.startsWith('%')) pidStr = pidStr.substring(1);
            const pid = parseInt(pidStr);
            
            if (window.processManager && window.processManager.killJob(pid)) {
                return { output: `[${pid}] Terminated` };
            }
            return { error: `bash: kill: (${pid}) - No such process` };
        });

        this.register('usermod', (args, stdin, term, fs) => {
            const lIdx = args.indexOf('-l');
            if (lIdx === -1 || !args[lIdx + 1]) {
                return { error: "usermod: usage: usermod -l new_username old_username" };
            }
            const newUsername = args[lIdx + 1];
            const oldUsername = args[args.length - 1];
            
            if (newUsername === oldUsername || oldUsername === '-l') {
                return { error: "usermod: invalid or missing parameters" };
            }

            const currentUsername = term.env.USER || 'user';
            if (oldUsername !== currentUsername) {
                return { error: `usermod: user '${oldUsername}' does not exist` };
            }

            const oldHome = `/home/${oldUsername}`;
            const newHome = `/home/${newUsername}`;
            
            if (fs.resolvePath(oldHome)) {
                fs.mv(oldHome, newHome);
            } else {
                fs.createDir(newUsername, fs.resolvePath('/home'));
            }
            
            const passwd = fs.readFile('/etc/passwd');
            if (passwd.success) {
                const regex = new RegExp(`^${oldUsername}:x:1000:1000:${oldUsername}:/home/${oldUsername}:/bin/bash`, 'm');
                const updatedContent = passwd.output.replace(regex, `${newUsername}:x:1000:1000:${newUsername}:/home/${newUsername}:/bin/bash`);
                fs.writeFile('/etc/passwd', updatedContent);
            }
            
            term.env.USER = newUsername;
            term.env.HOME = newHome;
            term.updatePrompt();

            return { output: `Username successfully changed to '${newUsername}'. Home directory moved to '${newHome}'.` };
        });
    }
}

window.commandRegistry = new CommandRegistry();
