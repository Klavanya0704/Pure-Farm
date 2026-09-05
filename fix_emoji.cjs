const fs = require('fs');
let content = fs.readFileSync('src/components/pages.tsx', 'utf8');
content = content.replace('Create Account ??', 'Create Account 🌱');
fs.writeFileSync('src/components/pages.tsx', content);
