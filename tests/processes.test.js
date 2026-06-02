const fs = require('fs');
const assert = require('assert');

function runTestsForFile(filepath) {
    console.log(`\nTesting ${filepath}...`);
    let code = fs.readFileSync(filepath, 'utf-8');

    // Remove the global assignment to avoid issues in Node environment
    code = code.replace('window.processManager = new ProcessManager();', '');

    // Create a temporary file and expose the ProcessManager class
    const tempFile = `tests/processes_temp_${Date.now()}.js`;
    const script = `
// mock for global window object which is used in getProcesses
global.window = {
    terminal: {
        env: { USER: 'testuser' }
    }
};

${code}
module.exports = { ProcessManager };
`;
    fs.writeFileSync(tempFile, script);

    const { ProcessManager } = require(`../${tempFile}`);

    // Mock for Terminal
    const mockTerminal = {
        printLine: () => {},
        escapeHTML: (str) => String(str)
    };

    let passed = 0;
    let total = 0;
    let exitCode = 0;

    try {
        const pm = new ProcessManager();

        // Test 1: Add a job
        total++;
        const job1 = pm.addJob('sleep 100', mockTerminal);
        assert.strictEqual(job1.id, 1, "First job ID should be 1");
        assert.strictEqual(pm.jobs.length, 1, "Jobs array should have 1 item");
        console.log("✅ Add job passed");
        passed++;

        // Test 2: killJob successfully
        total++;
        const killed = pm.killJob(job1.id);
        assert.strictEqual(killed, true, "killJob should return true for existing job");
        assert.strictEqual(pm.jobs.length, 0, "Jobs array should be empty after killJob");
        console.log("✅ killJob existing job passed");
        passed++;

        // Test 3: killJob failure (job doesn't exist)
        total++;
        const failedKill = pm.killJob(999);
        assert.strictEqual(failedKill, false, "killJob should return false for non-existent job");
        console.log("✅ killJob non-existent job passed");
        passed++;

        // Test 4: killJob handles multiple jobs correctly
        total++;
        const j2 = pm.addJob('sleep 200', mockTerminal);
        const j3 = pm.addJob('sleep 300', mockTerminal);
        const j4 = pm.addJob('sleep 400', mockTerminal);

        assert.strictEqual(pm.jobs.length, 3, "Should have 3 jobs");

        const killedJ3 = pm.killJob(j3.id);
        assert.strictEqual(killedJ3, true, "Should successfully kill middle job");
        assert.strictEqual(pm.jobs.length, 2, "Should have 2 jobs left");
        assert.strictEqual(pm.jobs[0].id, j2.id, "First remaining job should be j2");
        assert.strictEqual(pm.jobs[1].id, j4.id, "Second remaining job should be j4");
        console.log("✅ killJob with multiple jobs passed");
        passed++;

    } catch (e) {
        console.error("❌ Test failed:", e);
        exitCode = 1;
    } finally {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        // cleanup global variables
        delete global.window;
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
