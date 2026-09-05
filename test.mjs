import https from 'https';
https.get('https://source.unsplash.com/1600x900/?paddy,seed', (res) => {
  console.log(res.statusCode, res.headers.location);
});
