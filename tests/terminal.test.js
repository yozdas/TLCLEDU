const fs = require('fs');
const assert = require('assert');
const path = require('path');

async function runTestsForFile(filepath) {
    console.log(`\nTesting ${filepath}...`);
    // Simple way to load the Terminal class for node
    let code = fs.readFileSync(filepath, 'utf-8');
    code = code.replace('window.Terminal = Terminal;', '');
    const tempFileName = `terminal_temp_${Date.now()}_${Math.random().toString(36).substring(7)}.js`;
    const tempFilePath = path.join(__dirname, tempFileName);
    const script = `
${code}
module.exports = { Terminal };
`;
    fs.writeFileSync(tempFilePath, script);

    // clear require cache if needed, though we generate unique names
    const { Terminal } = require(tempFilePath);

    // Mock DOM
    const mockElements = {};
    global.document = {
        getElementById: (id) => {
            if (!mockElements[id]) {
                mockElements[id] = {
                    addEventListener: () => {},
                    classList: { add: () => {}, remove: () => {} },
                    style: {},
                    value: '',
                    focus: () => {}
                };
            }
            return mockElements[id];
        },
        addEventListener: () => {}
    };
    global.navigator = { clipboard: { readText: async () => "" } };
    global.window = { addEventListener: () => {}, getSelection: () => ({ toString: () => "" }) };

    const mockFs = {
        pwd: () => "/home/user"
    };
    const mockCallback = () => {};

    let passed = 0;
    let total = 0;
    let exitCode = 0;

    try {
        const terminal = new Terminal(mockFs, mockCallback);

        // Test 1: Valid arithmetic evaluation
        total++;
        const validResult = terminal.evaluateCondition('(( 5 + 5 ))');
        assert.strictEqual(validResult, 10, "Valid arithmetic should return 10");
        console.log("✅ Valid arithmetic evaluation passed");
        passed++;

        // Test 2: Invalid arithmetic evaluation (syntax error test for the missing error case)
        total++;
        const invalidResult = terminal.evaluateCondition('(( 5 + ++* 5 ))');
        assert.strictEqual(invalidResult, false, "Invalid arithmetic should return false, caught by catch block");
        console.log("✅ Invalid arithmetic evaluation passed");
        passed++;

        // Test 3: Variable resolution
        total++;
        terminal.env['A'] = 5;
        terminal.env['B'] = 3;
        const varResult = terminal.evaluateCondition('(( A * B ))');
        assert.strictEqual(varResult, 15, "Arithmetic with variables should evaluate correctly");
        console.log("✅ Arithmetic with variables evaluation passed");
        passed++;

        // Test 4: Another syntax error
        total++;
        const syntaxErrorResult = terminal.evaluateCondition('(( 5 + ))');
        assert.strictEqual(syntaxErrorResult, false, "Syntax error arithmetic should return false");
        console.log("✅ Syntax error arithmetic evaluation passed");
        passed++;

        // Test 5: Clipboard read exception handling
        total++;
        let consoleWarnCalled = false;
        let warnMessage = '';
        const originalWarn = console.warn;
        console.warn = (msg, err) => {
            consoleWarnCalled = true;
            warnMessage = msg;
        };

        const error = new Error('Clipboard error');
        global.navigator = {
            clipboard: {
                readText: async () => {
                    throw error;
                }
            }
        };

        const btnPaste = document.getElementById('menu-paste');
        if (btnPaste && btnPaste.onclick) {
            await btnPaste.onclick();
        }

        assert.strictEqual(consoleWarnCalled, true, "console.warn should be called when clipboard read fails");
        assert.strictEqual(warnMessage, 'Failed to read clipboard contents:', "Warning message should match expected text");

        // Restore console.warn
        console.warn = originalWarn;
        console.log("✅ Clipboard read exception handling passed");
        passed++;

    } catch (e) {
        console.error("❌ Test failed:", e);
        exitCode = 1;
    } finally {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }

    console.log(`${filepath} tests passed: ${passed}/${total}`);
    return exitCode;
}

async function runAll() {
    let finalExitCode = 0;
    finalExitCode |= await runTestsForFile(path.join(__dirname, '../js/terminal.js'));
    finalExitCode |= await runTestsForFile(path.join(__dirname, '../en/js/terminal.js'));

    if (finalExitCode !== 0) {
        process.exit(finalExitCode);
    }
}
runAll();
