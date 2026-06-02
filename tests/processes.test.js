const fs = require('fs');
const assert = require('assert');
const path = require('path');

function runTestsForFile(filepath) {
    console.log(`\nTesting ${filepath}...`);
    let code = fs.readFileSync(filepath, 'utf-8');

    // Remove assignment to window to prevent ReferenceError
    code = code.replace('window.processManager = new ProcessManager();', '');

    // Create temp file in the same directory as this script
    const tempFileName = `processes_temp_${Date.now()}_${Math.random().toString(36).substring(7)}.js`;
    const tempFilePath = path.join(__dirname, tempFileName);
    const script = `
${code}
module.exports = { ProcessManager };
`;
    fs.writeFileSync(tempFilePath, script);

    const { ProcessManager } = require(tempFilePath);

    // Mock terminal for tests
    const mockTerminal = {
        printLine: (text) => {
            mockTerminal.lastPrint = text;
        },
        escapeHTML: (str) => str,
        env: { USER: 'testuser' },
        lastPrint: null
    };

    // Setup global window object
    global.window = {
        terminal: mockTerminal
    };

    let passed = 0;
    let total = 0;
    let exitCode = 0;

    try {
        const pm = new ProcessManager();

        // Test 1: Initial state
        total++;
        assert.deepStrictEqual(pm.jobs, [], "Jobs array should be initially empty");
        assert.strictEqual(pm.nextJobId, 1, "Initial nextJobId should be 1");
        console.log("✅ Initial state test passed");
        passed++;

        // Test 2: addJob
        total++;
        const job = pm.addJob('sleep 10', mockTerminal);
        assert.strictEqual(job.id, 1, "First job should have ID 1");
        assert.strictEqual(job.command, 'sleep 10', "Job should have correct command");
        assert.strictEqual(job.status, 'Running', "Job status should be Running");
        assert.strictEqual(pm.jobs.length, 1, "Jobs array should contain 1 element");
        assert.strictEqual(pm.nextJobId, 2, "nextJobId should increment");
        assert.strictEqual(mockTerminal.lastPrint, '[1] sleep 10 &', "Terminal should print correct output");
        console.log("✅ addJob test passed");
        passed++;

        // Test 3: getJobs
        total++;
        const jobsOutput = pm.getJobs();
        assert.strictEqual(jobsOutput, '[1]  Running              sleep 10', "getJobs should return formatted string");
        console.log("✅ getJobs test passed");
        passed++;

        // Test 4: killJob
        total++;
        const killSuccess = pm.killJob(1);
        assert.strictEqual(killSuccess, true, "killJob should return true for valid ID");
        assert.deepStrictEqual(pm.jobs, [], "Jobs array should be empty after killing job");
        const killFail = pm.killJob(999);
        assert.strictEqual(killFail, false, "killJob should return false for invalid ID");
        console.log("✅ killJob test passed");
        passed++;

        // Test 5: getProcesses
        total++;
        const processes = pm.getProcesses();
        assert.ok(processes.length > 0, "Should return an array of processes");
        const bashProc = processes.find(p => p.name === 'bash');
        assert.strictEqual(bashProc.user, 'testuser', "Current user should be mapped correctly to user processes");
        console.log("✅ getProcesses test passed");
        passed++;

        // Test 6: killProcess
        total++;
        // Invalid pid
        const resultInvalid = pm.killProcess('abc');
        assert.ok(resultInvalid.error.includes("invalid PID") || resultInvalid.error.includes("geçersiz PID"), "Should handle invalid PID");

        // System process
        const resultSystem = pm.killProcess('1');
        assert.ok(resultSystem.error.includes("Operation not permitted") || resultSystem.error.includes("yetkiniz yok"), "Should protect system processes");

        // Valid process
        const resultValid = pm.killProcess('9999');
        assert.strictEqual(resultValid.success, true, "Should return success for valid process kill attempt");
        console.log("✅ killProcess test passed");
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

let finalExitCode = 0;
finalExitCode |= runTestsForFile(path.join(__dirname, '../js/processes.js'));
finalExitCode |= runTestsForFile(path.join(__dirname, '../en/js/processes.js'));

if (finalExitCode !== 0) {
    process.exit(finalExitCode);
}
