const fs = require('fs');
const path = require('path');

const targets = [
  'public/file.svg',
  'public/globe.svg',
  'public/logo.svg',
  'public/next.svg',
  'public/vercel.svg',
  'public/window.svg',
  'public/images/test.txt',
  'server_log.txt',
  'playwright-report',
  'test-results'
];

targets.forEach(target => {
  const fullPath = path.join(process.cwd(), target);
  if (fs.existsSync(fullPath)) {
    try {
      if (fs.lstatSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Deleted directory: ${target}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${target}`);
      }
    } catch (err) {
      console.error(`Error deleting ${target}:`, err.message);
    }
  } else {
    console.log(`Target not found: ${target}`);
  }
});
