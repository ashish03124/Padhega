const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src', 'app');

function walkSync(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkSync(filePath);
        } else if (filePath.endsWith('.css') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let orig = content;

            // Handle Hex
            content = content.replace(/#8b5cf6/gi, '#305229');
            content = content.replace(/#ec4899/gi, '#4a7c3f');

            // Handle RGB with any spacing (use global and case-insensitive)
            content = content.replace(/139,\s*92,\s*246/gi, '48, 82, 41');
            content = content.replace(/236,\s*72,\s*153/gi, '74, 124, 63');

            if (content !== orig) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    }
}

walkSync(directory);
console.log("Finished script.");
