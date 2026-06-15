const fs = require('fs');
const assert = require('assert');
const path = require('path');

// Bölüm 35 (44. ders) "array-mapfile" regresyon testi.
// Eski script interaktif bir `read` döngüsü içeriyordu; simülatörde `window.prompt`'u
// 1000 kez açıp tarayıcıyı donduruyor ve ders geçilemiyordu. Bu test:
//   1. `bash scripts/array-mapfile` çalıştırınca window.prompt ASLA çağrılmamalı (donma yok),
//   2. çıktı diziyi gerçekten okumalı (öğe sayısı + ilk öğeler),
//   3. migrateFS eski (kayıtlı) interaktif scripti yenilemeli,
//   4. 44. ders (index 43, id 35.1) checkCompletion komutla geçmeli.
// Entegrasyon testi olduğu için modüller birlikte yüklenir (tek window paylaşılır).

function setupGlobals() {
    const state = { promptCount: 0 };
    const mk = () => ({
        addEventListener: () => {}, classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        style: {}, value: '', innerHTML: '', innerText: '', dataset: {},
        querySelectorAll: () => [], querySelector: () => null, appendChild: () => {}, focus: () => {}
    });
    const els = {};
    global.window = {
        addEventListener: () => {}, dispatchEvent: () => {}, getSelection: () => ({ toString: () => '' }),
        showToast: () => {}, DOMPurify: { sanitize: (s) => s },
        // Donma anında testi asmamak için 10 çağrıdan sonra patla (düzeltmeyle 0 olmalı).
        prompt: () => { state.promptCount++; if (state.promptCount > 10) throw new Error('PROMPT FLOOD: array-mapfile interaktif döngüye girdi'); return ''; }
    };
    global.prompt = global.window.prompt;
    const store = {};
    global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
    global.document = { getElementById: id => (id === 'sidebar-accordion' ? null : (els[id] || (els[id] = mk()))), createElement: () => mk(), addEventListener: () => {} };
    global.navigator = { clipboard: { readText: async () => '', writeText: async () => {} } };
    return state;
}

function loadInto(rel, base) {
    const code = fs.readFileSync(path.join(__dirname, base, rel), 'utf-8');
    (0, eval)(`(function(){ ${code}\n })();`);
}

function runTestsFor(base, label) {
    console.log(`\nTesting ${label} (array-mapfile / 44. ders)...`);
    let passed = 0, total = 0, exitCode = 0;
    try {
        // --- Test 1: script flood yapmadan çalışır ve diziyi okur ---
        const state = setupGlobals();
        loadInto('js/fs.js', base); loadInto('js/processes.js', base); loadInto('js/vim.js', base);
        loadInto('js/commands.js', base); loadInto('js/terminal.js', base); loadInto('js/course.js', base);

        const fsObj = global.window.fs;
        const term = new global.window.Terminal(fsObj, () => {});
        const out = [];
        term.printLine = (h) => { out.push(String(h).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')); };

        total++;
        term.processCommand('bash scripts/array-mapfile /etc/passwd');
        assert.strictEqual(state.promptCount, 0, 'window.prompt çağrılmamalı (interaktif donma yok)');
        const joined = out.join('\n');
        assert.ok(/\b147\b/.test(joined), 'çıktı dizi uzunluğunu (147) içermeli');
        assert.ok(/apple banana cherry date/.test(joined), 'çıktı ilk dört öğeyi içermeli');
        assert.ok(/\blemon\b/.test(joined), 'çıktı 11. öğeyi (lemon) içermeli');
        console.log('✅ array-mapfile interaktif değil ve diziyi doğru okuyor');
        passed++;

        // --- Test 2: migrateFS eski cached scripti yeniler ---
        total++;
        const node = fsObj.resolvePath('/home/user/scripts/array-mapfile');
        node.content = '#!/bin/bash\nmapfile -t -n 32767 words < "$WORDLIST"\nwhile [[ -z $REPLY ]]; do\n  echo x\n  read -r -p "q? > "\ndone';
        assert.ok(/while\s*\[\[\s*-z\s*\$REPLY/.test(node.content), 'ön koşul: eski interaktif içerik');
        fsObj.migrateFS();
        const after = fsObj.resolvePath('/home/user/scripts/array-mapfile').content;
        assert.ok(!/while\s*\[\[\s*-z\s*\$REPLY/.test(after), 'migrateFS eski read döngüsünü temizlemeli');
        assert.ok(/mapfile -t words/.test(after), 'yenilenmiş script yeni içeriği taşımalı');
        console.log('✅ migrateFS eski (kayıtlı) array-mapfile scriptini yeniliyor');
        passed++;

        // --- Test 3: 44. ders (index 43, id 35.1) checkCompletion geçiyor ---
        total++;
        const cm = new global.window.CourseManager(() => {});
        const lesson44 = cm.lessons[43];
        assert.strictEqual(lesson44.id, '35.1', '44. ders (index 43) id 35.1 olmalı');
        assert.ok(lesson44.checkCompletion('bash scripts/array-mapfile /etc/passwd', fsObj, term), '44. ders komutla geçmeli');
        console.log('✅ 44. ders (Bölüm 35: Diziler) checkCompletion geçiyor');
        passed++;

    } catch (e) {
        console.error('❌ Test failed:', e);
        exitCode = 1;
    }

    console.log(`${label} tests passed: ${passed}/${total}`);
    return exitCode;
}

let finalExitCode = 0;
finalExitCode |= runTestsFor('..', 'root js');
finalExitCode |= runTestsFor('../en', 'en/ js');

if (finalExitCode !== 0) {
    process.exit(finalExitCode);
}
