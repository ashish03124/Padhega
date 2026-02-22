const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app');

function isGlowKeptRule(line, context) {
    if (context.includes('.mode-btn.active')) return true;
    if (context.includes('.timer-glow-bg')) return true;
    if (context.includes('.play-btn') || context.includes('.timer-action-btn')) return true;
    // Keeping basic shadow for cards if it's a drop shadow, not a glow, but user wants "flat with subtle borders"
    return false;
}

function processCssFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Split into rules
    let rules = content.split('}');

    for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];
        if (!rule.trim()) continue;

        let headerMatch = rule.split('{');
        if (headerMatch.length < 2) continue;

        let selector = headerMatch[0];

        if (isGlowKeptRule(rule, selector)) {
            continue; // Skip the ones we want to keep
        }

        // Remove text-shadow
        rules[i] = rules[i].replace(/\s*text-shadow:[^;]+;/g, '');

        // Remove glowing box-shadows (ones containing colors other than black/transparent, or 0 0 offsets)
        // Actually, just remove all box-shadows that look like glows, but user said "make other elements flat"
        // so we can remove most box-shadows. Wait, --glass-shadow dropping shadow is fine, but maybe let's remove it if it's a colored glow.
        rules[i] = rules[i].replace(/\s*box-shadow:[^;]+rgba\([^,]+,\s*[^,]+,\s*[^,]+,\s*0\.\d+\);/g, (match) => {
            if (match.includes('rgba(0, 0, 0') || match.includes('var(--glass-shadow)')) {
                return match; // keep pure black drop shadows
            }
            return ''; // remove colored glows
        });

        rules[i] = rules[i].replace(/\s*box-shadow:\s*0\s+0\s+[^;]+;/g, ''); // remove 0 0 blur effects

        // Also remove text-glow class completely
        if (selector.includes('.text-glow')) {
            rules[i] = rules[i].replace(/{[\s\S]*$/, '{ /* glow removed */');
        }
    }

    let result = rules.join('}');
    // Clean up empty lines
    result = result.replace(/\n\s*\n/g, '\n\n');

    if (result !== original) {
        fs.writeFileSync(filePath, result, 'utf8');
        console.log('Flattened:', filePath);
    }
}

function walk(d) {
    fs.readdirSync(d).forEach(f => {
        let p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.css')) {
            processCssFile(p);
        }
    });
}

walk(dir);
console.log("Done flattening UI!");
