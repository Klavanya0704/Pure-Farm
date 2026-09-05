const https = require('https');
const fs = require('fs');

const ids = [
  '1500382017468-9049fed747ef', // farm landscape
  '1586771107445-d3af9119ec80', // maybe tractor
  '1625246333195-78d9c38ad449', // tractor field
  '1592982537447-7440770cbfc9', // the current one
  '1589923188900-85dae524346b', // tractor in field
  '1530836369250-ef71a3f55220', // farmer in field sunset
  '1560493676-04071c5f467c', // agriculture India
];

async function check(id) {
  return new Promise((resolve) => {
    https.get(`https://images.unsplash.com/photo-${id}?w=600`, (res) => {
      console.log(id, res.statusCode);
      resolve();
    });
  });
}

(async () => {
  for (let id of ids) await check(id);
})();
