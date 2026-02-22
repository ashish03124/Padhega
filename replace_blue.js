const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app');

function walk(d) {
    fs.readdirSync(d).forEach(f => {
        let p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.css') || p.endsWith('.tsx')) {
            let orig = fs.readFileSync(p, 'utf8');
            let c = orig;

            // 59, 130, 246 -> 16, 185, 129
            c = c.replace(/59,\s*130,\s*246/g, '16, 185, 129');
            // 30, 58, 138 -> 6, 78, 59
            c = c.replace(/30,\s*58,\s*138/g, '6, 78, 59');
            // 96, 165, 250 -> 52, 211, 153
            c = c.replace(/96,\s*165,\s*250/g, '52, 211, 153');

            // Hex replacements
            c = c.replace(/#3b82f6/ig, '#10b981');
            c = c.replace(/#1e3a8a/ig, '#064e3b');
            c = c.replace(/#60a5fa/ig, '#34d399');

            if (c !== orig) {
                fs.writeFileSync(p, c, 'utf8');
                console.log('Fixed:', p);
            }
        }
    });
}
walk(dir);
console.log("Blue elimination done!");
