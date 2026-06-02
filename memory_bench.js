const term = { env: {} };
for (let i = 0; i < 1000; i++) {
    term.env[`KEY_${i}`] = `VALUE_${i}`;
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

function runPreallocatedArrayJoin() {
    const keys = Object.keys(term.env);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        arr[i] = `${key}=${term.env[key]}`;
    }
    return arr.join('\n');
}

const ITERATIONS = 10000;

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
measureMemory(runPreallocatedArrayJoin, "Preallocated Array + Join");
