const fs = require('fs');
const effectsJs = fs.readFileSync('src/js/effects.js', 'utf8');

const regex = /register\\(['"\`]?(.+?)['"\`]?,\\s*[\`'"]([\\s\\S]*?)[\`'"],\\s*\\{/g;
let match;
let stubs = [];

while ((match = regex.exec(effectsJs)) !== null) {
    const id = match[1];
    const code = match[2].trim();
    if (code.length < 50 || code.includes('TODO') || code.includes('// Placeholder')) {
        stubs.push(id);
    }
}

console.log('Stubbed or extremely short shaders:');
console.log(stubs.join(', '));
