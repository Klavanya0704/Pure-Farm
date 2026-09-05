import re

with open('src/components/pages.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update CartPage
content = re.sub(
    r'(<PageShell\s+eyebrow="Cart")',
    r'<PageShell bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000" \1',
    content
)

# Update the inner classes for glass styling in CartPage
# Need to make sure we don't break anything, so just replace standard cardClass with glassCardClass in CartPage
content = re.sub(
    r'(export function CartPage.*?)(className="space-y-4")',
    r'\1\2',
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'(export function CartPage.*?)(className=\{cardClass\})',
    r'\1className={glassCardClass}',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'(export function CartPage.*?)(className=\{cardClass\})',
    r'\1className={glassCardClass}',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'(export function CartPage.*?)(className=\{cardClass\})',
    r'\1className={glassCardClass}',
    content,
    flags=re.DOTALL
)

with open('src/components/pages.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("CartPage updated.")
