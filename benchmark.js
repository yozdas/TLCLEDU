const term = {
    env: {}
};

for (let i = 0; i < 1000; i++) {
    term.env[`KEY_${i}`] = `VALUE_${i}`;
}

function printenvOld() {
    let output = '';
    for (const key of Object.keys(term.env)) {
        output += `${key}=${term.env[key]}\n`;
    }
    return { output: output.trim() };
}

function printenvNewMapJoin() {
    return { output: Object.keys(term.env).map(key => `${key}=${term.env[key]}`).join('\n') };
}

function printenvNewArray() {
    const keys = Object.keys(term.env);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        arr[i] = `${key}=${term.env[key]}`;
    }
    return { output: arr.join('\n') };
}

const ITERATIONS = 100000;

console.time('Old');
for (let i = 0; i < ITERATIONS; i++) {
    printenvOld();
}
console.timeEnd('Old');

console.time('New (Map + Join)');
for (let i = 0; i < ITERATIONS; i++) {
    printenvNewMapJoin();
}
console.timeEnd('New (Map + Join)');

console.time('New (Preallocated Array + Join)');
for (let i = 0; i < ITERATIONS; i++) {
    printenvNewArray();
}
console.timeEnd('New (Preallocated Array + Join)');
