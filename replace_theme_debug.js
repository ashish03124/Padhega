const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app');
let logs = [];

function walk(d) {
    if (!fs.existsSync(d)) {
        logs.push("Dir not found: " + d);
        return;
    }
    fs.readdirSync(d).forEach(f => {
        let p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.css') || p.endsWith('.tsx')) {
            let orig = fs.readFileSync(p, 'utf8');
            let c = orig;

            c = c.replace(/139,\s*92,\s*246/g, '48, 82, 41');
            c = c.replace(/236,\s*72,\s*153/g, '74, 124, 63');
            c = c.replace(/#8b5cf6/ig, '#305229');
            c = c.replace(/#ec4899/ig, '#4a7c3f');

            if (c !== orig) {
                fs.writeFileSync(p, c, 'utf8');
                logs.push("Fixed: " + p);
            }
        }
    });
}
try {
    walk(dir);
} catch (e) {
    logs.push("Error: " + e.toString());
}
fs.writeFileSync(path.join(__dirname, 'log.txt'), logs.join('\n'));
