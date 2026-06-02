const fs = require('fs');
const assert = require('assert');

function runTestsForFile(filepath) {
    console.log(`\nTesting ${filepath}...`);
    // Simple way to load the VimEditor class for node
    let code = fs.readFileSync(filepath, 'utf-8');
    const tempFile = `tests/vim_temp_${Date.now() + "_" + Math.random().toString(36).substring(7)}.js`;
    const script = `
${code}
module.exports = { VimEditor };
`;
    fs.writeFileSync(tempFile, script);

    // clear require cache if needed, though we generate unique names
    const { VimEditor } = require(`../${tempFile}`);

    // Mock DOM elements
    const createMockElement = () => {
        let listeners = {};
        return {
            addEventListener: (event, cb) => {
                if (!listeners[event]) listeners[event] = [];
                listeners[event].push(cb);
            },
            dispatchEvent: (event) => {
                if (listeners[event.type]) {
                    listeners[event.type].forEach(cb => cb(event));
                }
            },
            classList: {
                add: () => {},
                remove: () => {}
            },
            style: {},
            textContent: '',
            value: '',
            focus: () => {}
        };
    };

    const mockElements = {
        'vim-editor': createMockElement(),
        'vim-textarea': createMockElement(),
        'vim-mode': createMockElement(),
        'vim-filename': createMockElement(),
        'vim-command-line': createMockElement()
    };

    global.document = {
        getElementById: (id) => mockElements[id] || createMockElement()
    };

    let windowEvents = {};
    global.window = {
        dispatchEvent: (event) => {
             if (windowEvents[event.type]) {
                 windowEvents[event.type].forEach(cb => cb(event));
             }
        },
        addEventListener: (event, cb) => {
             if (!windowEvents[event]) windowEvents[event] = [];
             windowEvents[event].push(cb);
        }
    };
    global.Event = class Event { constructor(type) { this.type = type; } };

    const mockFs = {
        writeFile: (filename, content) => {
            mockFs.lastWrite = { filename, content };
        },
        lastWrite: null
    };

    const mockTerminal = {
        fs: mockFs,
        inputEl: {
            disabled: false,
            focus: () => {}
        }
    };

    let passed = 0;
    let total = 0;
    let exitCode = 0;

    try {
        const vim = new VimEditor(mockTerminal);

        // Test 1: Initial state
        total++;
        assert.strictEqual(vim.active, false, "Vim should initially be inactive");
        assert.strictEqual(vim.mode, 'NORMAL', "Vim should start in NORMAL mode");
        console.log("✅ Initial state test passed");
        passed++;

        // Test 2: Open file
        total++;
        vim.open('test.txt', 'Hello World');
        assert.strictEqual(vim.active, true, "Vim should be active after open");
        assert.strictEqual(vim.filename, 'test.txt', "Filename should be set correctly");
        assert.strictEqual(mockElements['vim-textarea'].value, 'Hello World', "Textarea value should be set");
        assert.strictEqual(vim.mode, 'NORMAL', "Mode should be NORMAL after open");
        assert.strictEqual(mockTerminal.inputEl.disabled, true, "Terminal input should be disabled");
        console.log("✅ Open file test passed");
        passed++;

        // Test 3: Mode transitions
        total++;
        // Trigger keydown on textarea
        const triggerKey = (key) => {
            const event = { type: 'keydown', key, preventDefault: () => {} };
            mockElements['vim-textarea'].dispatchEvent(event);
        };

        // NORMAL -> INSERT
        triggerKey('i');
        assert.strictEqual(vim.mode, 'INSERT', "Mode should be INSERT after 'i'");

        // INSERT -> NORMAL
        triggerKey('Escape');
        assert.strictEqual(vim.mode, 'NORMAL', "Mode should be NORMAL after Escape");

        // NORMAL -> COMMAND
        triggerKey(':');
        assert.strictEqual(vim.mode, 'COMMAND', "Mode should be COMMAND after ':'");
        assert.strictEqual(vim.command, '', "Command should be empty initially");

        // COMMAND -> NORMAL (via Escape)
        triggerKey('Escape');
        assert.strictEqual(vim.mode, 'NORMAL', "Mode should be NORMAL after Escape from COMMAND");

        console.log("✅ Mode transitions test passed");
        passed++;

        // Test 4: Command execution
        total++;
        vim.open('test2.txt', 'New Content');
        mockFs.lastWrite = null; // Reset

        // Go to COMMAND mode and type 'w' then Enter
        triggerKey(':');
        triggerKey('w');
        triggerKey('Enter');

        assert.strictEqual(mockFs.lastWrite.filename, 'test2.txt', "writeFile should be called with correct filename");
        assert.strictEqual(mockFs.lastWrite.content, 'New Content', "writeFile should be called with correct content");
        assert.strictEqual(vim.mode, 'NORMAL', "Mode should return to NORMAL after command execution");

        console.log("✅ Command execution (:w) test passed");
        passed++;

        // Test 5: Command execution (:wq)
        total++;
        mockFs.lastWrite = null; // Reset

        triggerKey(':');
        triggerKey('w');
        triggerKey('q');
        triggerKey('Enter');

        assert.strictEqual(mockFs.lastWrite.filename, 'test2.txt', "writeFile should be called with correct filename on :wq");
        assert.strictEqual(vim.active, false, "Vim should be inactive after :wq");
        assert.strictEqual(mockTerminal.inputEl.disabled, false, "Terminal input should be re-enabled after :wq");

        console.log("✅ Command execution (:wq) test passed");
        passed++;

        // Test 6: Command execution (:q!)
        total++;
        vim.open('test3.txt', 'Content to discard');
        mockFs.lastWrite = null; // Reset

        triggerKey(':');
        triggerKey('q');
        triggerKey('!');
        triggerKey('Enter');

        assert.strictEqual(mockFs.lastWrite, null, "writeFile should not be called on :q!");
        assert.strictEqual(vim.active, false, "Vim should be inactive after :q!");

        console.log("✅ Command execution (:q!) test passed");
        passed++;

    } catch (e) {
        console.error("❌ Test failed:", e);
        exitCode = 1;
    } finally {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
    }

    console.log(`${filepath} tests passed: ${passed}/${total}`);
    return exitCode;
}

let finalExitCode = 0;
finalExitCode |= runTestsForFile('js/vim.js');
finalExitCode |= runTestsForFile('en/js/vim.js');

if (finalExitCode !== 0) {
    process.exit(finalExitCode);
}
