import re

with open('src/components/pages.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update OrderPage (both PageShells)
content = re.sub(
    r'(<PageShell\s+title="Order confirmed")',
    r'<PageShell bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000" \1',
    content
)

content = re.sub(
    r'(<PageShell\s+eyebrow="Checkout")',
    r'<PageShell bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000" \1',
    content
)

# Also fix the form class in OrderPage to use glassCardClass
content = re.sub(
    r'className=\{\\$\{cardClass\} space-y-4\\}',
    r'className={\ space-y-4}',
    content
)

with open('src/components/pages.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("OrderPage updated.")
