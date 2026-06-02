class Terminal {
    constructor(fsObject, onCommandExecuted) {
        this.fs = fsObject;
        this.onCommandExecuted = onCommandExecuted;
        
        this.outputDiv = document.getElementById('terminal-output');
        this.inputEl = document.getElementById('terminal-input');
        this.promptEl = document.getElementById('terminal-prompt');
        
        this.history = [];
        this.historyIndex = -1;
        this.env = {
            USER: 'user',
            HOME: '/home/user',
            SHELL: '/bin/bash',
            PATH: '/usr/local/bin:/usr/bin:/bin',
            LANG: 'en_US.UTF-8',
            TERM: 'xterm-256color',
            PS1: '\\u@linux:\\w\\$ '
        };
        this.aliases = {};
        this.installedPackages = new Set();
        this.blockBuffer = [];
        this.blockDepth = 0;
        this.hereDocDelimiter = null;
        this.currentHereDoc = null;
        this.localScopes = [];
        this.shouldExit = false;
        this.functions = {};
 
        this.setupEventListeners();
        this.setupContextMenu();
        this.updatePrompt();
    }

    setupContextMenu() {
        const menu = document.getElementById('custom-context-menu');
        const terminalWrapper = document.getElementById('terminal-wrapper');

        if (!menu || !terminalWrapper) return;

        terminalWrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            menu.style.top = `${e.clientY}px`;
            menu.style.left = `${e.clientX}px`;
            menu.classList.remove('hidden');
        });

        document.addEventListener('click', () => {
            menu.classList.add('hidden');
        });

        const btnPaste = document.getElementById('menu-paste');
        if (btnPaste) {
            btnPaste.onclick = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    this.inputEl.value += text;
                    this.inputEl.focus();
                } catch (err) {
                    console.warn('Failed to read clipboard contents:', err);
                }
            };
        }

        const btnCopy = document.getElementById('menu-copy');
        if (btnCopy) {
            btnCopy.onclick = () => {
                const selectedText = window.getSelection().toString();
                if (selectedText) {
                    navigator.clipboard.writeText(selectedText);
                }
            };
        }

        const btnClear = document.getElementById('menu-clear');
        if (btnClear) {
            btnClear.onclick = () => {
                this.outputDiv.innerHTML = '';
            };
        }
    }

    setVim(vim) {
        this.vim = vim;
    }

    setupEventListeners() {
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const commandText = this.inputEl.value.trim();
                this.inputEl.value = '';
                this.processCommand(commandText);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.history.length > 0 && this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.inputEl.value = this.history[this.history.length - 1 - this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputEl.value = this.history[this.history.length - 1 - this.historyIndex];
                } else if (this.historyIndex === 0) {
                    this.historyIndex = -1;
                    this.inputEl.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.handleTabCompletion();
            } else if (e.key === 'c' && e.ctrlKey) {
                e.preventDefault();
                const currentLine = this.inputEl.value;
                this.printLine(currentLine + '^C', true);
                this.inputEl.value = '';
                this.blockBuffer = [];
                this.blockDepth = 0;
                this.updatePrompt();
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                this.outputDiv.innerHTML = '';
                this.updatePrompt();
            } else if (e.key === 'u' && e.ctrlKey) {
                e.preventDefault();
                this.inputEl.value = '';
            }
        });

        document.getElementById('terminal-body').addEventListener('click', () => {
            // Sadece bir metin seçili değilse input'a odaklan
            if (window.getSelection().toString().length === 0) {
                this.inputEl.focus();
            }
        });
    }

    handleTabCompletion() {
        const inputStr = this.inputEl.value;
        const parts = inputStr.split(' ');
        const lastPart = parts[parts.length - 1];
        if (!lastPart) return;

        const items = Object.values(this.fs.currentDir.children).map(child => child.name);
        const matches = items.filter(name => name.startsWith(lastPart));

        if (matches.length === 1) {
            parts[parts.length - 1] = matches[0];
            this.inputEl.value = parts.join(' ');
        } else if (matches.length > 1) {
            this.printLine(inputStr, true);
            this.printLine(this.escapeHTML(matches.join('  ')));
            this.updatePrompt();
        }
    }

    updatePrompt() {
        if (this.blockDepth > 0) {
            this.promptEl.textContent = '> ';
            return;
        }

        const path = this.fs.pwd();
        let displayPath = path;
        const homeDir = this.env.HOME || '/home/user';
        if (path === homeDir) displayPath = '~';
        else if (path.startsWith(homeDir + '/')) displayPath = '~' + path.substring(homeDir.length);
        
        let ps1 = this.env.PS1 || '\\u@linux:\\w\\$ ';
        ps1 = ps1.replace('\\u', this.env.USER || 'user')
                 .replace('\\h', 'linux')
                 .replace('\\w', displayPath)
                 .replace('\\$', '$');
        
        this.promptEl.textContent = ps1;
    }

    silentExecute(cmdString) {
        const pipeSegments = cmdString.split('|').map(s => s.trim());
        let currentStdin = null;
        for (let i = 0; i < pipeSegments.length; i++) {
            const segment = pipeSegments[i];
            const tokens = this.tokenize(segment);
            if (tokens.length === 0) continue;
            const cmdName = tokens[0];
            const cmdArgs = this.expandArgs(tokens.slice(1));
            const result = window.commandRegistry.execute(cmdName, cmdArgs, currentStdin, this);
            if (result.error) return '';
            currentStdin = result.output;
        }
        return (currentStdin || '').trim();
    }

    expandArgs(args) {
        let expanded = [];
        for (let arg of args) {
            // 0. Subshell Expansion $(...) or `...`
            if (arg.includes('$(')) {
                arg = arg.replace(/\$\((.*?)\)/g, (match, cmd) => {
                    return this.silentExecute(cmd);
                });
            }
            if (arg.includes('`')) {
                arg = arg.replace(/`(.*?)`/g, (match, cmd) => {
                    return this.silentExecute(cmd);
                });
            }

            // 1. Variable Expansion $VAR or ${VAR}
            // Variable expansion
            arg = this.expandVars(arg);

            // 1. Brace Expansion {a,b} and {1..5}
            if (arg.includes('{') && arg.includes('}')) {
                // Range {1..5} or {a..e}
                const rangeMatch = arg.match(/(.*)\{([a-zA-Z0-9])\.\.([a-zA-Z0-9])\}(.*)/);
                if (rangeMatch) {
                    const prefix = rangeMatch[1];
                    const start = rangeMatch[2];
                    const end = rangeMatch[3];
                    const suffix = rangeMatch[4];
                    
                    const isNumeric = !isNaN(start) && !isNaN(end);
                    if (isNumeric) {
                        const s = parseInt(start);
                        const e = parseInt(end);
                        const step = s <= e ? 1 : -1;
                        for (let i = s; (step > 0 ? i <= e : i >= e); i += step) {
                            expanded.push(prefix + i + suffix);
                        }
                    } else {
                        const s = start.charCodeAt(0);
                        const e = end.charCodeAt(0);
                        const step = s <= e ? 1 : -1;
                        for (let i = s; (step > 0 ? i <= e : i >= e); i += step) {
                            expanded.push(prefix + String.fromCharCode(i) + suffix);
                        }
                    }
                    continue;
                }

                // List {a,b,c}
                const listMatch = arg.match(/(.*)\{(.*)\}(.*)/);
                if (listMatch) {
                    const prefix = listMatch[1];
                    const options = listMatch[2].split(',');
                    const suffix = listMatch[3];
                    options.forEach(opt => expanded.push(prefix + opt + suffix));
                    continue;
                }
            }
            
            // 2. Wildcard Expansion * (Improved: Path support)
            if (arg.includes('*')) {
                let dirPath = '.';
                let pattern = arg;
                
                if (arg.includes('/')) {
                    const lastSlash = arg.lastIndexOf('/');
                    dirPath = arg.substring(0, lastSlash) || '/';
                    pattern = arg.substring(lastSlash + 1);
                }
                
                const targetDir = this.fs.resolvePath(dirPath);
                if (targetDir && targetDir.type === 'dir') {
                    const starsPart = pattern.split('*');
                    const prefix = starsPart[0];
                    const suffix = starsPart[1] || '';
                    const items = Object.keys(targetDir.children);
                    
                    const matches = items.filter(name => name.startsWith(prefix) && name.endsWith(suffix));
                    
                    if (matches.length > 0) {
                        const results = matches.map(m => {
                            if (dirPath === '.') return m;
                            if (dirPath === '/') return '/' + m;
                            return (dirPath.endsWith('/') ? dirPath : dirPath + '/') + m;
                        });
                        expanded.push(...results);
                        continue;
                    }
                }
            }

            expanded.push(arg);
        }
        return expanded;
    }

    expandVars(str) {
        if (!str) return '';
        
        // 1. ${#arr[@]} or ${#arr[*]} (Array length)
        str = str.replace(/\$\{#([a-zA-Z0-9_]+)\[[@*]\]\}/g, (match, name) => {
            const val = this.getVar(name);
            return Array.isArray(val) ? val.length : (val !== undefined ? '1' : '0');
        });

        // 2. ${arr[@]} or ${arr[*]} (All elements)
        str = str.replace(/\$\{([a-zA-Z0-9_]+)\[[@*]\]\}/g, (match, name) => {
            const val = this.getVar(name);
            return Array.isArray(val) ? val.join(' ') : (val !== undefined ? val : '');
        });

        // 3. ${arr[index]} (Specific element)
        str = str.replace(/\$\{([a-zA-Z0-9_]+)\[([^\]]+)\]\}/g, (match, name, index) => {
            const val = this.getVar(name);
            if (Array.isArray(val)) {
                const idx = parseInt(this.expandVars(index));
                return val[idx] !== undefined ? val[idx] : '';
            }
            return index === '0' ? (val !== undefined ? val : '') : '';
        });

        // 4. ${#VAR} (String length)
        str = str.replace(/\$\{#([a-zA-Z0-9_]+)\}/g, (match, name) => {
            const val = this.getVar(name);
            return val !== undefined ? String(val).length : '0';
        });

        // 5. ${VAR}
        str = str.replace(/\$\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
            return this.getVar(name);
        });

        // 6. $VAR (Simple)
        str = str.replace(/\$([a-zA-Z0-9_#?@*!$]+)/g, (match, name) => {
            return this.getVar(name);
        });

        return str;
    }

    escapeHTML(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    getVar(name) {
        // Local scopes (reverse)
        for (let i = this.localScopes.length - 1; i >= 0; i--) {
            if (this.localScopes[i][name] !== undefined) return this.localScopes[i][name];
        }
        // Global env
        return this.env[name] !== undefined ? this.env[name] : '';
    }

    printLine(html, isInput = false) {
        const div = document.createElement('div');
        div.className = 'terminal-line';
        if (isInput) {
            const promptSpan = document.createElement('span');
            promptSpan.className = 'prompt';
            promptSpan.textContent = this.promptEl.textContent;
            div.appendChild(promptSpan);
            
            const cmdSpan = document.createElement('span');
            cmdSpan.textContent = html;
            div.appendChild(cmdSpan);
        } else {
            // Local fallback that preserves safe styled span tags instead of encoding the whole string
            if (typeof window !== 'undefined' && window.DOMPurify) {
                div.innerHTML = window.DOMPurify.sanitize(html);
            } else {
                // Safely create a text node if DOMPurify fails completely, or simply assign string text
                // However, since we ensure local dompurify is included, it shouldn't fail.
                // If it does, we strip tags manually to avoid both XSS and showing literal '&lt;span...'
                const tempDiv = document.createElement('div');
                tempDiv.textContent = html.replace(/<[^>]*>?/gm, '');
                div.appendChild(tempDiv);
            }
        }
        this.outputDiv.appendChild(div);
        
        const terminalBody = document.getElementById('terminal-body');
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    tokenize(str) {
        const tokens = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let parenDepth = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if ((char === '"' || char === "'") && (i === 0 || str[i-1] !== '\\')) {
                if (inQuotes && quoteChar === char) {
                    inQuotes = false;
                } else if (!inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                } else {
                    current += char;
                }
            } else if (char === '(' && !inQuotes) {
                parenDepth++;
                current += char;
            } else if (char === ')' && !inQuotes) {
                parenDepth--;
                current += char;
            } else if (char === ' ' && !inQuotes && parenDepth === 0) {
                if (current.length > 0) {
                    tokens.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }
        if (current.length > 0) tokens.push(current);
        return tokens;
    }

    processCommand(cmdString) {
        if (!cmdString && this.blockDepth === 0) {
            this.printLine('', true);
            return;
        }

        let finalCmd = cmdString;
        if (this.blockDepth === 0) {
            this.printLine(cmdString, true);
            const firstWord = cmdString.split(' ')[0];
            if (this.aliases[firstWord]) {
                finalCmd = cmdString.replace(firstWord, this.aliases[firstWord]);
            }
            if (this.history[this.history.length - 1] !== cmdString) {
                this.history.push(cmdString);
            }
            this.historyIndex = -1;
        } else {
            // Continuation line
            this.printOutput(`<span class="prompt-continuation">> </span>${this.escapeHTML(cmdString)}\n`);
        }

        const segments = finalCmd.split(';').map(c => c.trim()).filter(c => c.length > 0);
        
        for (const segment of segments) {
            const tokens = this.tokenize(segment);
            if (tokens.length === 0) continue;
            const firstToken = tokens[0];

            // Block Start Keywords
            if (['if', 'while', 'until', 'for', 'case', '{'].includes(firstToken) || firstToken.includes('()')) {
                this.blockDepth++;
            }
            
            this.blockBuffer.push(segment);

            // HERE Document detection
            if (segment.includes('<<')) {
                const match = segment.match(/<<-?\s*["']?([a-zA-Z0-9_]+)["']?/);
                if (match) {
                    this.hereDocDelimiter = match[1];
                    this.blockDepth++;
                }
            }

            // Block End Keywords
            if (['fi', 'done', 'esac', '}'].includes(firstToken) || firstToken === this.hereDocDelimiter) {
                if (firstToken === this.hereDocDelimiter) {
                    // Extract HERE doc content
                    const startIndex = this.blockBuffer.findIndex(s => s.includes('<<'));
                    const content = this.blockBuffer.slice(startIndex + 1).join('\n');
                    this.currentHereDoc = this.expandVars(content);
                    this.blockBuffer = this.blockBuffer.slice(0, startIndex + 1);
                    this.hereDocDelimiter = null;
                }
                this.blockDepth--;
            }

            if (this.blockDepth <= 0) {
                const fullCommand = this.blockBuffer.join('; ');
                const hasBlock = this.blockBuffer.some(s => ['if', 'while', 'until', 'for', 'case', '{'].includes(s.split(' ')[0]));
                
                this.blockBuffer = [];
                this.blockDepth = 0;

                if (fullCommand) {
                    if (fullCommand.endsWith('&')) {
                        const cmd = fullCommand.substring(0, fullCommand.length - 1).trim();
                        if (window.processManager) {
                            window.processManager.addJob(cmd, this);
                        } else {
                            this.executeChained(cmd);
                        }
                    } else if (hasBlock) {
                        this.executeBlock(fullCommand);
                    } else {
                        this.executeChained(fullCommand);
                    }
                }
            }
        }

        this.updatePrompt();
        
        if (this.blockDepth <= 0 && this.onCommandExecuted) {
            this.onCommandExecuted(cmdString, this.fs);
        }
    }

    executeChained(segment) {
        // Simple parser for && and ||
        // Note: This doesn't handle complex nesting with (), but works for basic TLCL cases
        const tokens = [];
        let current = "";
        for (let i = 0; i < segment.length; i++) {
            if (segment.substr(i, 2) === '&&') {
                tokens.push({ cmd: current.trim(), op: '&&' });
                current = "";
                i++;
            } else if (segment.substr(i, 2) === '||') {
                tokens.push({ cmd: current.trim(), op: '||' });
                current = "";
                i++;
            } else {
                current += segment[i];
            }
        }
        tokens.push({ cmd: current.trim(), op: null });

        let lastSuccess = true;
        for (let i = 0; i < tokens.length; i++) {
            const { cmd, op } = tokens[i];
            if (!cmd) continue;

            if (lastSuccess) {
                // Execute if last was success OR if it's the first command
                lastSuccess = this.executePipeline(cmd);
            } else {
                // Last failed, only execute if current follows ||
                if (i > 0 && tokens[i-1].op === '||') {
                    lastSuccess = this.executePipeline(cmd);
                } else {
                    lastSuccess = false;
                }
            }
        }
    }

    executePipeline(cmdString) {
        const pipeSegments = cmdString.split('|').map(s => s.trim());
        let currentStdin = null;
        
        for (let i = 0; i < pipeSegments.length; i++) {
            const segment = pipeSegments[i];
            const tokens = this.tokenize(segment);
            if (tokens.length === 0) continue;

            // Handle assignments (A=1 B=2 arr=(x y z))
            let tokenIdx = 0;
            let assignmentFound = false;
            while (tokenIdx < tokens.length) {
                const token = tokens[tokenIdx];
                
                // Array assignment: arr=(val1 val2)
                const arrayMatch = token.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=\((.*)\)$/);
                if (arrayMatch) {
                    const varName = arrayMatch[1];
                    const content = arrayMatch[2].trim();
                    this.env[varName] = content ? content.split(/\s+/) : [];
                    tokenIdx++;
                    assignmentFound = true;
                    continue;
                }

                const assignMatch = token.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
                const exportMatch = token.match(/^export\s+([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
                const match = assignMatch || exportMatch;

                if (match) {
                    const varName = match[1];
                    let varValue = match[2].trim();
                    
                    if ((varValue.startsWith('"') && varValue.endsWith('"')) || 
                        (varValue.startsWith("'") && varValue.endsWith("'"))) {
                        varValue = varValue.substring(1, varValue.length - 1);
                    }

                    this.env[varName] = varValue;
                    tokenIdx++;
                    assignmentFound = true;
                } else if (token === 'declare' && tokens[tokenIdx+1] && tokens[tokenIdx+1].startsWith('-a')) {
                    // declare -a arr=(...)
                    const nextToken = tokens[tokenIdx+1];
                    const arrMatch = nextToken.match(/^-a\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:=\((.*)\))?$/) || 
                                    (tokens[tokenIdx+2] && tokens[tokenIdx+2].match(/^([a-zA-Z_][a-zA-Z0-9_]*)=\((.*)\)$/));
                    
                    if (arrMatch) {
                        const name = arrMatch[1];
                        const content = arrMatch[2] || "";
                        this.env[name] = content ? content.split(/\s+/) : [];
                        tokenIdx += (nextToken.includes('=') ? 2 : 3);
                        assignmentFound = true;
                    } else {
                        tokenIdx++;
                    }
                } else {
                    break;
                }
            }

            if (tokenIdx >= tokens.length) {
                if (assignmentFound) continue;
                else break;
            }

            const remainingTokens = tokens.slice(tokenIdx);
            
            // Redirection parsing
            let redirectOut = null;
            let redirectErr = null;
            let appendOut = false;
            let appendErr = false;
            let errToOut = false;
            let args = [];
            
            for (let j = 0; j < remainingTokens.length; j++) {
                const t = remainingTokens[j];
                if (t === '>') {
                    redirectOut = remainingTokens[j+1]; j++;
                } else if (t === '>>') {
                    redirectOut = remainingTokens[j+1]; appendOut = true; j++;
                } else if (t === '2>') {
                    redirectErr = remainingTokens[j+1]; j++;
                } else if (t === '2>>') {
                    redirectErr = remainingTokens[j+1]; appendErr = true; j++;
                } else if (t === '2>&1') {
                    errToOut = true;
                } else if (t === '<<' || t === '<<-') {
                    // HERE Document logic
                    const delim = remainingTokens[j+1];
                    j++;
                    // In our simulation, the content follows in the block buffer
                    if (this.currentHereDoc) {
                        currentStdin = this.currentHereDoc;
                        this.currentHereDoc = null;
                    }
                } else {
                    args.push(t);
                }
            }

            if (args.length === 0) return true;

            let cmdName = args[0];
            let cmdArgs = args.slice(1);

            // exit command
            if (cmdName === 'exit') {
                this.env['?'] = cmdArgs[0] ? parseInt(cmdArgs[0]) : 0;
                this.shouldExit = true;
                return true;
            }

            // local command
            if (cmdName === 'local') {
                if (this.localScopes.length > 0) {
                    const currentScope = this.localScopes[this.localScopes.length - 1];
                    cmdArgs.forEach(arg => {
                        const match = arg.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
                        if (match) {
                            currentScope[match[1]] = match[2];
                        } else {
                            currentScope[arg] = '';
                        }
                    });
                }
                return true;
            }

            // Alias expansion
            if (this.env['alias_' + cmdName]) {
                const aliasValue = this.env['alias_' + cmdName];
                const aliasTokens = this.tokenize(aliasValue);
                cmdName = aliasTokens[0];
                cmdArgs = [...aliasTokens.slice(1), ...cmdArgs];
            }
            
            cmdArgs = this.expandArgs(cmdArgs);
            
            if (this.xtrace) {
                this.printLine(`<span style="color: var(--text-muted)">+ ${this.escapeHTML(cmdName)} ${this.escapeHTML(cmdArgs.join(' '))}</span>`);
            }
            
            // Priority: Functions > Builtins
            if (this.functions[cmdName]) {
                const body = this.functions[cmdName];
                
                // Push local scope
                this.localScopes.push({});
                
                cmdArgs.forEach((val, idx) => { this.env[idx + 1] = val; });
                this.env['#'] = cmdArgs.length;
                this.env['@'] = cmdArgs.join(' ');
                
                const cmds = body.split(';').map(c => c.trim()).filter(c => c.length > 0);
                for (const cmd of cmds) {
                    this.processCommand(cmd);
                    if (this.shouldExit) break;
                }
                
                // Pop local scope
                this.localScopes.pop();
                
                currentStdin = '';
                continue;
            }

            // Gamification Lock Check
            const isScriptExecution = cmdName.startsWith('./') || cmdName.startsWith('/');
            const isUnlocked = isScriptExecution || (window.courseManager && window.courseManager.isCommandUnlocked(cmdName));
            
            if (window.courseManager && !isUnlocked) {
                const unlockingLesson = window.courseManager.lessons.find(l => l.unlocked && l.unlocked.includes(cmdName));
                const hint = unlockingLesson ? ` (You will learn this command in Chapter ${this.escapeHTML(unlockingLesson.id.split('.')[0])})` : '';
                const errMsg = `bash: ${cmdName}: command not learned yet${hint}`;
                if (redirectErr || errToOut) {
                    if (errToOut && redirectOut) {
                        this.fs[appendOut ? 'appendFile' : 'writeFile'](redirectOut, errMsg + '\n');
                    } else if (redirectErr) {
                        this.fs[appendErr ? 'appendFile' : 'writeFile'](redirectErr, errMsg + '\n');
                    }
                } else {
                    this.printLine(`<span style="color: #ef4444">${this.escapeHTML(errMsg)}</span>`);
                }
                this.env['?'] = 127;
                return false;
            }

            const result = window.commandRegistry.execute(cmdName, cmdArgs, currentStdin, this);
            
            if (result.error) {
                const errMsg = result.error;
                if (redirectErr || errToOut) {
                    if (errToOut && redirectOut) {
                        this.fs[appendOut ? 'appendFile' : 'writeFile'](redirectOut, errMsg + '\n');
                    } else if (redirectErr) {
                        this.fs[appendErr ? 'appendFile' : 'writeFile'](redirectErr, errMsg + '\n');
                    }
                } else {
                    this.printLine(`<span style="color: #ef4444">${this.escapeHTML(errMsg)}</span>`);
                }
                this.env['?'] = 1;
                return false;
            }
            
            currentStdin = result.output;
            
            if (i === pipeSegments.length - 1) {
                if (redirectOut) {
                    if (appendOut) {
                        this.fs.appendFile(redirectOut, currentStdin || '');
                    } else {
                        this.fs.writeFile(redirectOut, currentStdin || '');
                    }
                } else {
                    if (!result.noPrint && currentStdin !== undefined && currentStdin !== null && currentStdin !== '') {
                        const escaped = this.escapeHTML(currentStdin);
                        const formatted = escaped.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
                        this.printLine(formatted);
                    }
                }
            }
        }
        this.env['?'] = 0;
        return true;
    }

    printOutput(html) {
        const div = document.createElement('div');
        div.className = 'terminal-line';
        if (typeof window !== 'undefined' && window.DOMPurify) {
            div.innerHTML = window.DOMPurify.sanitize(html);
        } else {
            const tempDiv = document.createElement('div');
            tempDiv.textContent = html.replace(/<[^>]*>?/gm, '');
            div.appendChild(tempDiv);
        }
        this.outputDiv.appendChild(div);
        this.outputDiv.scrollTop = this.outputDiv.scrollHeight;
    }

    executeBlock(fullCommand) {
        // Simple regex-based execution for common TLCL patterns
        const lines = fullCommand.split(';').map(l => l.trim()).filter(l => l.length > 0);
        const firstToken = lines[0].split(' ')[0];

        if (firstToken === 'function' || lines[0].includes('()')) {
            const name = firstToken === 'function' ? lines[0].split(' ')[1] : lines[0].split('(')[0].trim();
            const body = fullCommand.substring(fullCommand.indexOf('{') + 1, fullCommand.lastIndexOf('}')).trim();
            this.functions[name] = body;
            return;
        }

        if (fullCommand.startsWith('if')) {
            let depth = 0;
            let blocks = [{ condition: [], cmds: [] }];
            let currentPart = 'condition';
            let currentBlock = 0;
            
            let endIndex = -1;

            for (let i = 0; i < lines.length; i++) {
                let seg = lines[i];
                let tokens = this.tokenize(seg);
                if (tokens.length === 0) continue;

                let first = tokens[0];

                if (first === 'if') {
                    if (depth === 0) seg = seg.substring(seg.indexOf('if') + 2).trim();
                    depth++;
                } else if (first === 'then') {
                    if (tokens[1] === 'if') {
                        if (depth === 1) {
                            currentPart = 'then';
                            seg = seg.substring(seg.indexOf('then') + 4).trim();
                        }
                        depth++;
                    } else if (depth === 1) {
                        currentPart = 'then';
                        let rest = seg.substring(seg.indexOf('then') + 4).trim();
                        if (rest) blocks[currentBlock].cmds.push(rest);
                        continue;
                    }
                } else if (first === 'elif' && depth === 1) {
                    currentBlock++;
                    blocks.push({ condition: [], cmds: [] });
                    currentPart = 'condition';
                    let rest = seg.substring(seg.indexOf('elif') + 4).trim();
                    if (rest) blocks[currentBlock].condition.push(rest);
                    continue;
                } else if (first === 'else') {
                    if (tokens[1] === 'if') {
                        if (depth === 1) {
                            currentBlock++;
                            blocks.push({ condition: ['true'], cmds: [] });
                            currentPart = 'then';
                            seg = seg.substring(seg.indexOf('else') + 4).trim();
                        }
                        depth++;
                    } else if (depth === 1) {
                        currentBlock++;
                        blocks.push({ condition: ['true'], cmds: [] });
                        currentPart = 'then';
                        let rest = seg.substring(seg.indexOf('else') + 4).trim();
                        if (rest) blocks[currentBlock].cmds.push(rest);
                        continue;
                    }
                } else if (first === 'fi') {
                    depth--;
                    if (depth === 0) {
                        endIndex = i;
                        break;
                    }
                }

                if (depth >= 1 || (depth === 0 && currentPart === 'condition')) {
                    if (currentPart === 'condition') {
                        blocks[currentBlock].condition.push(seg);
                    } else {
                        if (seg.trim() !== '') {
                            blocks[currentBlock].cmds.push(seg);
                        }
                    }
                }
            }

            for (let b of blocks) {
                let condStr = b.condition.join('; ');
                if (this.evaluateCondition(condStr)) {
                    let cmdStr = b.cmds.join('; ');
                    if (cmdStr.trim() !== '') {
                        this.processCommand(cmdStr);
                    }
                    break;
                }
            }

            if (endIndex !== -1 && endIndex < lines.length - 1) {
                let remaining = lines.slice(endIndex + 1).join('; ');
                this.processCommand(remaining);
            }
        } else if (fullCommand.startsWith('while')) {
            const doIdx = fullCommand.indexOf('; do');
            const doneIdx = fullCommand.lastIndexOf('; done');
            const condition = fullCommand.substring(6, doIdx).trim();
            const body = fullCommand.substring(doIdx + 4, doneIdx).trim();

            let safety = 0;
            while (this.evaluateCondition(condition) && safety < 1000) {
                body.split(';').forEach(cmd => this.processCommand(cmd.trim()));
                safety++;
            }
        } else if (fullCommand.startsWith('for')) {
             // for i in list; do ... ; done
             const doIdx = fullCommand.indexOf('; do');
             const doneIdx = fullCommand.lastIndexOf('; done');
             if (doIdx === -1 || doneIdx === -1) return;

             const head = fullCommand.substring(4, doIdx).trim();
             const body = fullCommand.substring(doIdx + 4, doneIdx).trim();
             
             const [varName, ...rest] = head.split(' ');
             const inIdx = rest.indexOf('in');
             const list = rest.slice(inIdx + 1);
             
             for (const val of list) {
                 this.env[varName] = val;
                 body.split(';').forEach(cmd => this.processCommand(cmd.trim()));
             }
        } else if (fullCommand.startsWith('case')) {
            // case $VAR in pattern) cmd ;; esac
            const inIdx = fullCommand.indexOf('; in');
            const esacIdx = fullCommand.lastIndexOf('; esac');
            if (inIdx === -1 || esacIdx === -1) return;

            let varValue = fullCommand.substring(5, inIdx).trim();
            // Expand variable
            if (varValue.startsWith('"') && varValue.endsWith('"')) varValue = varValue.substring(1, varValue.length - 1);
            if (varValue.startsWith('$')) {
                const varName = varValue.substring(1);
                varValue = this.env[varName] || '';
            }

            const body = fullCommand.substring(inIdx + 4, esacIdx).trim();
            // Split by ;; but respect patterns
            const patterns = body.split(';;').map(p => p.trim()).filter(p => p.length > 0);
            
            for (const pBlock of patterns) {
                const braceIdx = pBlock.indexOf(')');
                if (braceIdx === -1) continue;
                
                const patternStr = pBlock.substring(0, braceIdx).trim();
                const cmdPart = pBlock.substring(braceIdx + 1).trim();
                
                // Handle multiple patterns like Y|y
                const pList = patternStr.split('|').map(s => s.trim());
                let match = false;
                for (const p of pList) {
                    if (p === '*') match = true;
                    else if (p === varValue) match = true;
                    // Simple glob match simulation
                    else if (p.includes('*')) {
                        const regex = new RegExp('^' + p.replace(/\*/g, '.*') + '$');
                        if (regex.test(varValue)) match = true;
                    }
                }

                if (match) {
                    cmdPart.split(';').forEach(cmd => this.processCommand(cmd.trim()));
                    break; // Execute only first matching block
                }
            }
        } else if (fullCommand.startsWith('until')) {
            const doIdx = fullCommand.indexOf('; do');
            const doneIdx = fullCommand.lastIndexOf('; done');
            if (doIdx === -1 || doneIdx === -1) return;

            const condition = fullCommand.substring(6, doIdx).trim();
            const body = fullCommand.substring(doIdx + 4, doneIdx).trim();

            let safety = 0;
            while (!this.evaluateCondition(condition) && safety < 1000) {
                body.split(';').forEach(cmd => this.processCommand(cmd.trim()));
                safety++;
            }
        }
    }

    evaluateCondition(cond) {
        let c = cond.trim();
        
        // Handle (( )) arithmetic
        if (c.startsWith('((') && c.endsWith('))')) {
            let expr = c.substring(2, c.length - 2).trim();
            // Expand variables in expression
            expr = expr.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, (match) => {
                if (match === 'true' || match === 'false') return match;
                return this.env[match] !== undefined ? this.env[match] : match;
            });

            expr = expr.replace(/\btrue\b/g, '1').replace(/\bfalse\b/g, '0');
            if (/[^0-9eE\s+\-*/%().<>=!&|?:^]/.test(expr)) return false;

            try {
                return Function('"use strict"; return (' + expr + ')')();
            } catch (e) { return false; }
        }
        
        // Remove outer brackets
        if (c.startsWith('[') && c.endsWith(']')) {
            c = c.substring(1, c.length - 1).trim();
            if (c.startsWith('[') && c.endsWith(']')) {
                c = c.substring(1, c.length - 1).trim();
            }
        }

        c = this.expandVars(c);
        
        // Strip any outer parentheses if it's like ! ( cond1 && cond2 )
        c = c.replace(/\(\s*/g, '').replace(/\s*\)/g, '');

        const parts = this.tokenize(c);
        if (parts.length === 0) return false;

        // Helper to evaluate a simple condition (no && or ||)
        const evalSimple = (tokens) => {
            if (tokens.length === 0) return false;
            
            // Create a copy so we don't modify the original array when shifting
            const tList = [...tokens];
            
            let negate = false;
            if (tList[0] === '!') {
                negate = true;
                tList.shift();
            }

            let result = false;
            if (tList.length === 2) {
                const op = tList[0];
                const val = tList[1];
                if (op === '-z') result = val.length === 0;
                else if (op === '-n') result = val.length > 0;
                else if (op === '-e') result = this.fs.resolvePath(val) !== null;
                else if (op === '-f') {
                    const node = this.fs.resolvePath(val);
                    result = node !== null && node.type === 'file';
                }
                else if (op === '-d') {
                    const node = this.fs.resolvePath(val);
                    result = node !== null && node.type === 'dir';
                }
            } else if (tList.length === 3) {
                const left = tList[0];
                const op = tList[1];
                const right = tList[2];

                if (op === '=' || op === '==') result = left === right;
                else if (op === '!=') result = left !== right;
                else if (op === '=~') {
                    try {
                        const regex = new RegExp(right);
                        result = regex.test(left);
                    } catch (e) {
                        result = false;
                    }
                }
                else if (op === '-eq') result = parseInt(left) == parseInt(right);
                else if (op === '-ne') result = parseInt(left) != parseInt(right);
                else if (op === '-gt') result = parseInt(left) > parseInt(right);
                else if (op === '-lt') result = parseInt(left) < parseInt(right);
                else if (op === '-ge') result = parseInt(left) >= parseInt(right);
                else if (op === '-le') result = parseInt(left) <= parseInt(right);
            } else if (tList.length === 1) {
                if (tList[0] === 'true' || tList[0] === '0') result = true;
                else if (tList[0] === 'false' || tList[0] === '1') result = false;
                else result = tList[0].length > 0;
            }
            
            return negate ? !result : result;
        };

        // If there are && or || operators, split and process them left-to-right
        let i = 0;
        let currentGroup = [];
        let expression = [];

        while (i < parts.length) {
            const token = parts[i];
            if (token === '&&' || token === '||') {
                expression.push({ type: 'val', tokens: currentGroup });
                expression.push({ type: 'op', op: token });
                currentGroup = [];
            } else {
                currentGroup.push(token);
            }
            i++;
        }
        if (currentGroup.length > 0) {
            expression.push({ type: 'val', tokens: currentGroup });
        }

        if (expression.length === 0) return false;

        let finalResult = evalSimple(expression[0].tokens);
        for (let j = 1; j < expression.length; j += 2) {
            const op = expression[j].op;
            const nextValTokens = expression[j + 1].tokens;
            const nextVal = evalSimple(nextValTokens);

            if (op === '&&') {
                finalResult = finalResult && nextVal;
            } else if (op === '||') {
                finalResult = finalResult || nextVal;
            }
        }

        return finalResult;
    }
}

window.Terminal = Terminal;
