import fs from 'fs';

const mappings = JSON.parse(fs.readFileSync('src/data/image_mappings.json', 'utf8'));

for (const key in mappings) {
   let url = mappings[key];
   if (url.includes('Agriculture_in_India.jpg') || url.includes('Fertilizer.jpg') || url.includes('Various_seeds.jpg') || url.includes('Plastic_mulch.jpg') || url.includes('Knapsack_sprayer.jpg') || url.includes('Grain_silos.jpg') || url.includes('Insect_trap.jpg')) {
      mappings[key] = `https://placehold.co/600x450/eef2ff/3730a3?text=${encodeURIComponent(key)}`;
   }
}

fs.writeFileSync('src/data/image_mappings.json', JSON.stringify(mappings, null, 2));

const productsContent = fs.readFileSync('src/data/products.ts', 'utf8');

// Replace IMAGE_MAPPINGS
let newContent = productsContent;

// Remove the old const IMAGE_MAPPINGS
newContent = newContent.replace(/const IMAGE_MAPPINGS: Record<string, string> = {[\s\S]*?};\n/, '');

const mappingsString = 'const IMAGE_MAPPINGS: Record<string, string> = ' + JSON.stringify(mappings, null, 2) + ';\n';
newContent = newContent.replace('const ROWS: Row[] = [', mappingsString + '\nconst ROWS: Row[] = [');

// Fix the else block to remove fallback
newContent = newContent.replace(/IMAGE_MAPPINGS\[name\] \|\| 'https[^']+';/g, 'IMAGE_MAPPINGS[name];');

fs.writeFileSync('src/data/products.ts', newContent);
console.log('Updated products.ts');
