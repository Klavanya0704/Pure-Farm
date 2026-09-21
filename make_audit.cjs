const fs = require("fs");
const path = require("path");

const content = fs.readFileSync("src/data/products.ts", "utf-8");
const regex = /^\s*\[\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",/gm;
let m;
const products = [];
let i = 1;
while ((m = regex.exec(content)) !== null) {
  const id = `p-${String(i).padStart(3, "0")}`;
  products.push({ id, name: m[1], category: m[3] });
  i++;
}

let html = `
<html>
<head>
<style>
  body { font-family: sans-serif; background: #eee; }
  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
  .card { background: #fff; padding: 10px; text-align: center; border: 1px solid #ccc; }
  .card img { max-width: 100%; height: 150px; object-fit: cover; }
  .id { font-weight: bold; color: red; }
</style>
</head>
<body>
<div class="grid">
`;

for (const p of products) {
  html += `
  <div class="card">
    <div class="id">${p.id}</div>
    <div class="name" style="font-size: 12px;">${p.name}</div>
    <img src="file://${path.resolve("public/images/products/" + p.id + ".jpg")}" />
  </div>
  `;
}

html += `
</div>
</body>
</html>
`;

fs.writeFileSync("audit.html", html);
console.log("audit.html created.");
