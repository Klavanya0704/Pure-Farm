import google from 'googlethis';

async function test() {
  const query = "site:amazon.in Urea fertilizer 46%";
  try {
    const res = await google.search(query, { safe: false });
    console.log("Web Links:", res.results.map(r => r.url).slice(0, 3));
  } catch(e) {
    console.log(e);
  }
}
test();
