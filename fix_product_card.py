import re

with open('src/components/ProductCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useState import if missing
if 'useState' not in content:
    content = content.replace('import { Link }', 'import { useState } from "react";\nimport { Link }')

# Replace the img tag with one that handles errors
old_img = '''<Link to="/product/" params={{ id: product.id }} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </Link>'''

new_img = '''<Link to="/product/" params={{ id: product.id }} className="block h-full w-full">
          {(!product.image || imageError) ? (
             <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center select-none bg-[#f4fbf7] border-b border-black/5">
                <div className="w-12 h-12 rounded-full bg-white/60 shadow-sm flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-emerald-700/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-emerald-900/80 line-clamp-2 leading-tight">
                  {product.name}
                </p>
             </div>
          ) : (
             <img
               src={product.image}
               alt={product.name}
               onError={() => setImageError(true)}
               className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
             />
          )}
        </Link>'''

# Add imageError state to ProductCard component
if 'const [imageError, setImageError] = useState(false);' not in content:
    content = content.replace(
        'const { addItem } = useCart();',
        'const { addItem } = useCart();\n  const [imageError, setImageError] = useState(false);'
    )

content = content.replace(old_img, new_img)

with open('src/components/ProductCard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ProductCard image error handling added.")
