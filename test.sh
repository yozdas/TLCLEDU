#!/bin/bash
set -e
echo "Running tests..."
node tests/terminal.test.js
node tests/vim.test.js
node tests/fs.test.js
node tests/processes.test.js
