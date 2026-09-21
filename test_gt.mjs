import google from "googlethis";

async function test() {
  try {
    const images = await google.image("Urea 46% N fertilizer bag", { safe: false });
    console.log("Got " + images.length + " images.");
    if (images.length > 0) {
      console.log(images[0].url);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
