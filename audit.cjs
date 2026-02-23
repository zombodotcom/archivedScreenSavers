const fs = require('fs');
const appJs = fs.readFileSync('src/js/app.js', 'utf8');
const effectsJs = fs.readFileSync('src/js/effects.js', 'utf8');

const effectRegex = /effects:\s*\[([^\]]+)\]/g;
let match;
let allEffects = new Set();
while ((match = effectRegex.exec(appJs)) !== null) {
    const list = match[1].split(',').map(s => s.trim().replace(/'/g, ''));
    list.forEach(e => allEffects.add(e));
}

let missing = [];
let found = [];
allEffects.forEach(effect => {
    // Some effects might be initialized differently, but most are register('effect'
    if (effectsJs.includes(`register('${effect}'`) || effectsJs.includes(`register("${effect}"`) || effectsJs.includes(`register(\`${effect}\``)) {
        found.push(effect);
    } else {
        missing.push(effect);
    }
});

console.log(`Total Unique Effects Mentioned: ${allEffects.size}`);
console.log(`Found in effects.js: ${found.length}`);
console.log(`Missing from effects.js:\n${missing.join(', ')}`);
