const fs = require('fs');
const effectsJs = fs.readFileSync('src/js/effects.js', 'utf8');

const parts = effectsJs.split(/register\\s*\\(\\s*['"\\`]/);
let stubs = [];

for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    const quoteIndex = p.search(/['"\\`]/);
    if (quoteIndex === -1) continue;
    const effectId = p.substring(0, quoteIndex);

    // Find the next argument which is the template literal 
    const backtickStart = p.indexOf('\`');
    if (backtickStart === -1) continue;

    // find end of template literal, simplistic approach
    let backtickEnd = -1;
    for (let j = backtickStart + 1; j < p.length; j++) {
        if (p[j] === '\`' && p[j - 1] !== '\\\\') {
            backtickEnd = j;
            break;
        }
    }

    if (backtickEnd > -1) {
        const code = p.substring(backtickStart + 1, backtickEnd).trim();
        if (code.length < 150) {
            stubs.push(\`\${effectId} (\${code.length} chars)\`);
        }
    }
}

console.log('Very short shaders (likely stubs):');
console.log(stubs.join('\\n'));
