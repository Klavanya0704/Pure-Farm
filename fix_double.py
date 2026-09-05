import re
with open('src/components/pages.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<PageShell bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000" <PageShell\n        eyebrow="Cart"',
    '<PageShell bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000"\n        eyebrow="Cart"'
)

# And check for OrderPage just in case
content = content.replace(
    '<PageShell bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000" <PageShell\n          title="Order confirmed"',
    '<PageShell bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000"\n          title="Order confirmed"'
)
content = content.replace(
    '<PageShell bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000" <PageShell\n        eyebrow="Checkout"',
    '<PageShell bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000"\n        eyebrow="Checkout"'
)

with open('src/components/pages.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
