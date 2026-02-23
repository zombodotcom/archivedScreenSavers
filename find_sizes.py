import re
import os

with open('src/js/effects.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Match register('id', `code`, {opts})
pattern = re.compile(r"register\(\s*['\"]([^'\"]+)['\"]\s*,\s*`(.*?)`\s*,", re.DOTALL)

stubs = []
for match in pattern.finditer(content):
    effect_id = match.group(1)
    code = match.group(2).strip()
    if len(code) < 150 or "TODO" in code or "Placeholder" in code:
        stubs.append(f"{effect_id}: {len(code)} chars")

print("Likely Stubbed Shaders:")
for stub in stubs:
    print(stub)
