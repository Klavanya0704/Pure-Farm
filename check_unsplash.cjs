const http = require('https');
const urls = [
  'https://images.unsplash.com/photo-1595825833444-24e7384d2047?auto=format&fit=crop&w=2000',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000',
  'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=2000',
  'https://images.unsplash.com/photo-1592652461429-411a03e670d9?auto=format&fit=crop&w=2000',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=2000',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000',
  'https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000'
];

async function check() {
  for (let u of urls) {
    const res = await fetch(u, { method: 'HEAD' });
    console.log(u + ' -> ' + res.status);
  }
}
check();
