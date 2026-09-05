const http = require('https');
const urls = [
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000',
  'https://images.unsplash.com/photo-1586771107445-d3af9e170c66?auto=format&fit=crop&w=2000',
  'https://images.unsplash.com/photo-1505471768190-275e2ad7b3f9?auto=format&fit=crop&w=2000',
  'https://images.unsplash.com/photo-1595825833444-24e7384d2047?auto=format&fit=crop&w=2000'
];

async function check() {
  for (let u of urls) {
    const res = await fetch(u, { method: 'HEAD' });
    console.log(u + ' -> ' + res.status);
  }
}
check();
