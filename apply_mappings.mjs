import fs from 'fs';

const productsContent = fs.readFileSync('src/data/products.ts', 'utf8');
const mappings = JSON.parse(fs.readFileSync('src/data/image_mappings.json', 'utf8'));

// We need to inject the mappings object at the top or bottom of the file
// and replace the loop logic.

let newContent = productsContent;

// Remove the old AI logic
newContent = newContent.replace(/let prompt[\s\S]*?imageUrl = \`https:\/\/image\.pollinations\.ai[\s\S]*?;[\s\n]*}/m, 
`  else {
    imageUrl = IMAGE_MAPPINGS[name] || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Tractor_in_a_field.jpg/600px-Tractor_in_a_field.jpg';
  }`);

// Add the IMAGE_MAPPINGS at the top
const mappingsString = 'const IMAGE_MAPPINGS: Record<string, string> = ' + JSON.stringify(mappings, null, 2) + ';\n';
newContent = newContent.replace('const ROWS: Row[] = [', mappingsString + '\nconst ROWS: Row[] = [');

fs.writeFileSync('src/data/products.ts', newContent);
console.log('Updated products.ts');
