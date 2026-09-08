const fs = require('fs');

const content = fs.readFileSync('src/data/products.ts', 'utf-8');
const match = content.match(/const ROWS.*\[\s*\[([\s\S]*?)\];\s*export const PRODUCTS/);

const regex = /^\s*\[\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",/gm;
let m;
const products = [];
while ((m = regex.exec(content)) !== null) {
  products.push({ name: m[1], brand: m[2], category: m[3] });
}

fs.writeFileSync('product_list.json', JSON.stringify(products, null, 2));
console.log("Found", products.length, "products.");
