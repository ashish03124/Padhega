const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app');

function walk(d) {
    fs.readdirSync(d).forEach(f => {
        let p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.css') || p.endsWith('.tsx')) {
            let c = fs.readFileSync(p, 'utf8');
            let orig = c;

            // Foolproof exact substring replacements
            c = c.split('139, 92, 246').join('48, 82, 41');
            c = c.split('236, 72, 153').join('74, 124, 63');
            c = c.split('#8b5cf6').join('#305229');
            c = c.split('#8B5CF6').join('#305229');
            c = c.split('#ec4899').join('#4a7c3f');
            c = c.split('#EC4899').join('#4a7c3f');

            if (c !== orig) {
                fs.writeFileSync(p, c, 'utf8');
                console.log('Fixed:', p);
            }
        }
    });
}

walk(dir);
console.log("Done!");
