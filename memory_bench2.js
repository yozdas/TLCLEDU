const term = { env: {} };
for (let i = 0; i < 5000; i++) {
    term.env[`KEY_LONG_NAME_TEST_${i}`] = `VALUE_LONG_DATA_TEST_${i}_XYZ_${i}`;
}

function runConcatenation() {
    let output = '';
    for (const key of Object.keys(term.env)) {
        output += `${key}=${term.env[key]}\n`;
    }
    return output.trim();
}

function runMapJoin() {
    return Object.keys(term.env).map(key => `${key}=${term.env[key]}`).join('\n');
}

const ITERATIONS = 1000;

function measureMemory(fn, name) {
    global.gc(); // Force GC if exposed
    const startMemory = process.memoryUsage().heapUsed;
    const startTime = process.hrtime.bigint();

    for (let i = 0; i < ITERATIONS; i++) {
        fn();
    }

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage().heapUsed;

    console.log(`${name}:`);
    console.log(`  Time: ${Number(endTime - startTime) / 1000000} ms`);
    console.log(`  Memory diff: ${(endMemory - startMemory) / 1024 / 1024} MB`);
}

measureMemory(runConcatenation, "String Concatenation");
measureMemory(runMapJoin, "Array Map + Join");
