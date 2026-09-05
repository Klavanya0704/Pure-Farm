const fs = require('fs');
let content = fs.readFileSync('src/components/pages.tsx', 'utf8');

// 1. Change card width and glass styles
content = content.replace(
  'className="w-full max-w-md lg:ml-auto"',
  'className="w-full max-w-[540px] lg:ml-auto"'
);

content = content.replace(
  'className="bg-white/30 backdrop-blur-[24px] border border-white/40 rounded-[28px] p-8 lg:p-10 \nshadow-[0_8px_32px_rgba(0,0,0,0.2)]"',
  'className="bg-[rgba(255,255,255,0.18)] backdrop-blur-[24px] border border-[rgba(255,255,255,0.45)] rounded-[28px] p-8 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"'
);
content = content.replace(
  'className="bg-white/30 backdrop-blur-[24px] border border-white/40 rounded-[28px] p-8 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"',
  'className="bg-[rgba(255,255,255,0.18)] backdrop-blur-[24px] border border-[rgba(255,255,255,0.45)] rounded-[28px] p-8 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"'
);

// 2. Change input styles
content = content.replace(
  /h-12 w-full rounded-\[14px\] border border-white\/50 bg-white\/40 backdrop-blur-sm/g,
  'h-[52px] w-full rounded-[14px] border border-white/50 bg-[rgba(255,255,255,0.25)] backdrop-blur-sm'
);

// 3. Change button height
content = content.replace(
  /group relative w-full h-12 mt-4/g,
  'group relative w-full h-[52px] mt-4'
);

fs.writeFileSync('src/components/pages.tsx', content);
console.log('Styles updated.');
