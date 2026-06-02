const fs = require('fs');
const assert = require('assert');

function runTestsForFile(filepath) {
    console.log(`\nTesting ${filepath}...`);
    let code = fs.readFileSync(filepath, 'utf-8');
    code = code.replace('window.fs = new FileSystem();', '');
    const tempFile = `tests/fs_temp_${Date.now() + "_" + Math.random().toString(36).substring(7)}.js`;
    const script = `
${code}
module.exports = { FileSystem };
`;
    fs.writeFileSync(tempFile, script);

    const { FileSystem } = require(`../${tempFile}`);

    let passed = 0;
    let total = 0;
    let exitCode = 0;

    try {
        // Test 1: Valid init (No saved state)
        total++;
        global.localStorage = {
            getItem: (key) => null,
            setItem: (key, value) => {}
        };
        const validFs = new FileSystem();
        assert.strictEqual(validFs.root.name, '/', "Root should be initialized");
        assert.ok(validFs.root.children['home'], "Home directory should exist");
        console.log("✅ Initial default FS creation passed");
        passed++;

        // Test 2: Error path in constructor (Malformed JSON)
        total++;
        global.localStorage = {
            getItem: (key) => "{ malformed: json ",
            setItem: (key, value) => {}
        };

        const originalConsoleError = console.error;
        let consoleErrorCalled = false;
        console.error = () => { consoleErrorCalled = true; };

        let initDefaultFSCalled = false;
        const originalInitDefaultFS = FileSystem.prototype.initDefaultFS;
        FileSystem.prototype.initDefaultFS = function() {
            initDefaultFSCalled = true;
            originalInitDefaultFS.call(this);
        };

        const errorFs = new FileSystem();

        FileSystem.prototype.initDefaultFS = originalInitDefaultFS;
        console.error = originalConsoleError;

        assert.ok(consoleErrorCalled, "console.error should have been called upon malformed JSON");
        assert.ok(initDefaultFSCalled, "initDefaultFS should have been called on error");
        assert.strictEqual(errorFs.root.name, '/', "Root should be initialized despite error");
        assert.ok(errorFs.root.children['home'], "Home directory should be re-initialized despite error");
        console.log("✅ Malformed JSON error path passed");
        passed++;

        // Test 3: Happy path for importState
        total++;
        const validJson = JSON.stringify({
            name: '/',
            type: 'dir',
            children: {
                home: {
                    name: 'home',
                    type: 'dir',
                    children: {}
                }
            }
        });
        global.localStorage = {
            getItem: (key) => validJson,
            setItem: (key, value) => {}
        };

        const importedFs = new FileSystem();
        assert.strictEqual(importedFs.root.name, '/', "Root should be initialized");
        assert.ok(importedFs.root.children['home'], "Home directory should exist");
        console.log("✅ Valid importState path passed");
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
finalExitCode |= runTestsForFile('js/fs.js');
finalExitCode |= runTestsForFile('en/js/fs.js');

if (finalExitCode !== 0) {
    process.exit(finalExitCode);
}
