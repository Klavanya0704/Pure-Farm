const fs = require("fs");

let content = fs.readFileSync("src/data/products.ts", "utf-8");

// Remove IMAGE_MAPPINGS definition entirely
content = content.replace(
  /export const IMAGE_MAPPINGS: Record<string, string> = \{[\s\S]*?\};\n?/,
  "",
);

// Replace imageUrl logic
// From: let imageUrl = IMAGE_MAPPINGS[name] || "";
// To: let imageUrl = `/images/products/${id}.jpg`;
content = content.replace(
  /let imageUrl = IMAGE_MAPPINGS\[name\] \|\| .*?;/g,
  "let imageUrl = `/images/products/${id}.jpg`;",
);
content = content.replace(
  /let imageUrl = IMAGE_MAPPINGS\[name\];/g,
  "let imageUrl = `/images/products/${id}.jpg`;",
);

fs.writeFileSync("src/data/products.ts", content);
console.log("Updated products.ts to use local images!");
