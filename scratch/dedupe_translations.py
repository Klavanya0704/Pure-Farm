import re
import json

def dedupe():
    with open("src/i18n/translations.ts", "r", encoding="utf-8") as f:
        content = f.read()

    # Extract en object content and te object content
    en_match = re.search(r'en:\s*\{([\s\S]*?)\},\s*te:', content)
    te_match = re.search(r'te:\s*\{([\s\S]*?)\}\s*\};?', content)

    if not en_match or not te_match:
        print("Failed to find en or te blocks!")
        return

    en_block = en_match.group(1)
    te_block = te_match.group(1)

    # Function to parse key-value lines like `"key": "value",`
    def parse_block(block_str):
        d = {}
        # match "key": "value"
        pattern = re.compile(r'^\s*("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")\s*,?\s*$', re.MULTILINE)
        for m in pattern.finditer(block_str):
            k = json.loads(m.group(1))
            v = json.loads(m.group(2))
            d[k] = v
        return d

    en_dict = parse_block(en_block)
    te_dict = parse_block(te_block)

    print(f"Parsed {len(en_dict)} unique EN keys and {len(te_dict)} unique TE keys.")

    # Format cleanly
    new_code = "export type Language = 'en' | 'te';\n\nexport const translations: Record<Language, Record<string, string>> = {\n  en: {\n"

    for k in sorted(en_dict.keys()):
        clean_k = json.dumps(k)
        clean_v = json.dumps(en_dict[k])
        new_code += f"    {clean_k}: {clean_v},\n"

    new_code += "  },\n  te: {\n"

    for k in sorted(te_dict.keys()):
        clean_k = json.dumps(k)
        clean_v = json.dumps(te_dict[k])
        new_code += f"    {clean_k}: {clean_v},\n"

    new_code += "  },\n};\n"

    with open("src/i18n/translations.ts", "w", encoding="utf-8") as f:
        f.write(new_code)

    print("Deduplicated and formatted src/i18n/translations.ts successfully!")

if __name__ == "__main__":
    dedupe()
