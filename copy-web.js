const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'index.html');
const destDir = path.join(__dirname, 'www');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, path.join(destDir, 'index.html'));
console.log('[copy-web] index.html -> www/index.html');
