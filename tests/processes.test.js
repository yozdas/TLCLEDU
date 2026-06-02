const fs = require('fs');
const assert = require('assert');

function runTestsForFile(filepath) {
    console.log(`\nTesting ${filepath}...`);
    // Simple way to load the ProcessManager class for node
    let code = fs.readFileSync(filepath, 'utf-8');
    code = code.replace('window.processManager = new ProcessManager();', '');
    const tempFile = `tests/processes_temp_${Date.now()}.js`;
    const script = `
${code}
module.exports = { ProcessManager };
`;
    fs.writeFileSync(tempFile, script);

    // clear require cache if needed, though we generate unique names
    const { ProcessManager } = require(`../${tempFile}`);

    let passed = 0;
    let total = 0;
    let exitCode = 0;

    try {
        const pm = new ProcessManager();

        // Test 1: Valid numeric PID
        total++;
        const result1 = pm.killProcess(512);
        assert.deepStrictEqual(result1, { success: true }, "Valid numeric PID should return { success: true }");
        console.log("✅ Valid numeric PID passed");
        passed++;

        // Test 2: Valid string PID
        total++;
        const result2 = pm.killProcess("615");
        assert.deepStrictEqual(result2, { success: true }, "Valid string PID should return { success: true }");
        console.log("✅ Valid string PID passed");
        passed++;

        // Test 3: Invalid PID (NaN)
        total++;
        const result3 = pm.killProcess("abc");
        assert.strictEqual(result3.error !== undefined, true, "Invalid PID should return an error object");
        console.log("✅ Invalid PID (NaN) passed");
        passed++;

        // Test 4: System process PID (1)
        total++;
        const result4 = pm.killProcess(1);
        assert.strictEqual(result4.error !== undefined, true, "System process PID (1) should return an error object");
        console.log("✅ System process PID (1) passed");
        passed++;

        // Test 5: System process PID (2)
        total++;
        const result5 = pm.killProcess(2);
        assert.strictEqual(result5.error !== undefined, true, "System process PID (2) should return an error object");
        console.log("✅ System process PID (2) passed");
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
finalExitCode |= runTestsForFile('js/processes.js');
finalExitCode |= runTestsForFile('en/js/processes.js');

if (finalExitCode !== 0) {
    process.exit(finalExitCode);
}
