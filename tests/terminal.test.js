const fs = require('fs');
const assert = require('assert');

function runTestsForFile(filepath) {
    console.log(`\nTesting ${filepath}...`);
    // Simple way to load the Terminal class for node
    let code = fs.readFileSync(filepath, 'utf-8');
    code = code.replace('window.Terminal = Terminal;', '');
    const tempFile = `tests/terminal_temp_${Date.now() + "_" + Math.random().toString(36).substring(7)}.js`;
    const script = `
${code}
module.exports = { Terminal };
`;
    fs.writeFileSync(tempFile, script);

    // clear require cache if needed, though we generate unique names
    const { Terminal } = require(`../${tempFile}`);

    // Mock DOM
    global.document = {
        getElementById: () => ({
            addEventListener: () => {},
            classList: { add: () => {}, remove: () => {} },
            style: {}
        }),
        addEventListener: () => {}
    };
    global.navigator = { clipboard: { readText: async () => "" } };
    global.window = { addEventListener: () => {} };

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
finalExitCode |= runTestsForFile('js/terminal.js');
finalExitCode |= runTestsForFile('en/js/terminal.js');

if (finalExitCode !== 0) {
    process.exit(finalExitCode);
}
