import google from "googlethis";

async function test() {
  const query = "site:indiamart.com Urea 46% N fertilizer bag IFFCO";
  try {
    const res = await google.search(query, { safe: false });
    console.log("Web Links:", res.results.map((r) => r.url).slice(0, 3));
  } catch (e) {
    console.log(e);
  }
}
test();
