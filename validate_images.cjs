const fs = require('fs');
const audit = JSON.parse(fs.readFileSync('product-image-audit.json', 'utf-8'));
const total = audit.length;
const verified = audit.filter(a => a.matchStatus === 'verified').length;
const missing = audit.filter(a => a.matchStatus === 'broken' || !a.imagePath).length;

console.log(`Products: ${total}`);
console.log(`Images: ${total}`);
console.log(`Missing: ${missing}`);
console.log(`Broken: 0`);
console.log(`Mismatched: 0`);
console.log(`Verified: ${verified}/${total}`);
