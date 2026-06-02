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

    // Mock localStorage
    const mockStorage = {};
    global.localStorage = {
        getItem: (key) => mockStorage[key] || null,
        setItem: (key, value) => { mockStorage[key] = String(value); },
        removeItem: (key) => { delete mockStorage[key]; },
        clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
    };

    let passed = 0;
    let total = 0;
    let exitCode = 0;

    try {
        const fileSystem = new FileSystem();

        // Test 1: Initialization
        total++;
        assert.strictEqual(fileSystem.root.name, '/', "Root should be '/'");
        assert.strictEqual(fileSystem.pwd(), '/home/user', "Default pwd should be /home/user");
        console.log("✅ Initialization test passed");
        passed++;

        // Test 2: resolvePath
        total++;
        const rootDir = fileSystem.resolvePath('/');
        assert.strictEqual(rootDir.name, '/', "resolvePath('/') should return root");
        const homeDir = fileSystem.resolvePath('~');
        assert.strictEqual(homeDir.name, 'user', "resolvePath('~') should return user dir");
        const invalidDir = fileSystem.resolvePath('/invalid/path');
        assert.strictEqual(invalidDir, null, "resolvePath for invalid path should return null");
        console.log("✅ resolvePath test passed");
        passed++;

        // Test 3: cd and pwd
        total++;
        let res = fileSystem.cd('/usr/bin');
        assert.strictEqual(res.success, true, "cd to /usr/bin should succeed");
        assert.strictEqual(fileSystem.pwd(), '/usr/bin', "pwd should be /usr/bin");
        res = fileSystem.cd('/invalid');
        assert.strictEqual(res.success, false, "cd to invalid should fail");
        res = fileSystem.cd('/etc/passwd');
        assert.strictEqual(res.success, false, "cd to file should fail");
        console.log("✅ cd and pwd test passed");
        passed++;

        // Test 4: mkdir and touch
        total++;
        fileSystem.cd('/home/user');
        res = fileSystem.mkdir('testdir');
        assert.strictEqual(res.success, true, "mkdir testdir should succeed");
        assert.strictEqual(fileSystem.resolvePath('testdir').type, 'dir', "testdir should be a directory");
        res = fileSystem.touch('testfile.txt');
        assert.strictEqual(res.success, true, "touch testfile.txt should succeed");
        assert.strictEqual(fileSystem.resolvePath('testfile.txt').type, 'file', "testfile.txt should be a file");
        console.log("✅ mkdir and touch test passed");
        passed++;

        // Test 5: readFile and writeFile
        total++;
        res = fileSystem.writeFile('testfile.txt', 'hello fs');
        assert.strictEqual(res.success, true, "writeFile should succeed");
        res = fileSystem.readFile('testfile.txt');
        assert.strictEqual(res.success, true, "readFile should succeed");
        assert.strictEqual(res.output, 'hello fs', "readFile content should match");
        res = fileSystem.readFile('nonexistent.txt');
        assert.strictEqual(res.success, false, "readFile non-existent should fail");
        console.log("✅ readFile and writeFile test passed");
        passed++;

        // Test 6: rm
        total++;
        res = fileSystem.rm('testfile.txt');
        assert.strictEqual(res.success, true, "rm testfile.txt should succeed");
        assert.strictEqual(fileSystem.resolvePath('testfile.txt'), null, "testfile.txt should be deleted");
        res = fileSystem.rm('testdir');
        assert.strictEqual(res.success, false, "rm dir without recursive should fail");
        res = fileSystem.rm('testdir', { recursive: true, force: false });
        assert.strictEqual(res.success, true, "rm -r testdir should succeed");
        console.log("✅ rm test passed");
        passed++;

        // Test 7: cp and mv
        total++;
        fileSystem.touch('source.txt');
        fileSystem.writeFile('source.txt', 'content');
        res = fileSystem.cp('source.txt', 'dest.txt');
        assert.strictEqual(res.success, true, "cp should succeed");
        assert.strictEqual(fileSystem.resolvePath('dest.txt').content, 'content', "copied file should have same content");
        res = fileSystem.mv('dest.txt', 'moved.txt');
        assert.strictEqual(res.success, true, "mv should succeed");
        assert.strictEqual(fileSystem.resolvePath('dest.txt'), null, "old file should not exist");
        assert.strictEqual(fileSystem.resolvePath('moved.txt').content, 'content', "moved file should have content");
        console.log("✅ cp and mv test passed");
        passed++;

        // Test 8: state export/import
        total++;
        const stateStr = fileSystem.exportState();
        assert.strictEqual(typeof stateStr, 'string', "exportState should return a string");
        const newFs = new FileSystem();
        newFs.importState(stateStr);
        assert.strictEqual(newFs.pwd(), fileSystem.pwd(), "imported FS should have same pwd");
        assert.strictEqual(newFs.resolvePath('moved.txt').content, 'content', "imported FS should retain files");
        console.log("✅ export/import test passed");
        passed++;

        // Test 9: Error path in constructor (Malformed JSON)
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

        // Test 10: Happy path for importState with localStorage setup
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
