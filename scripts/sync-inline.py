"""Embed the CSS/JS sources in index.html for standalone HTML previews."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
page = root / 'index.html'
html = page.read_text(encoding='utf-8')
for name, tag, pattern in [
    ('style.css', 'style', r'<link rel="stylesheet" href="style.css">|<!-- BEGIN style.css -->.*?<!-- END style.css -->'),
    ('app.js', 'script', r'<script src="app.js" defer></script>|<!-- BEGIN app.js -->.*?<!-- END app.js -->'),
]:
    source = (root / name).read_text(encoding='utf-8')
    block = f'<!-- BEGIN {name} -->\n<{tag}>\n{source}\n</{tag}>\n<!-- END {name} -->'
    html, count = re.subn(pattern, lambda _: block, html, flags=re.S)
    if count != 1:
        raise SystemExit(f'Expected exactly one {name} block, got {count}')
# Inline JS executes after the DOM instead of relying on an external defer script.
script = re.search(r'<!-- BEGIN app.js -->.*?<!-- END app.js -->', html, re.S)
if script is None:
    raise SystemExit('Missing script block')
end = script.end() + (1 if html[script.end():].startswith('\n') else 0)
html = html[:script.start()] + html[end:]
html = html.replace('</body>', script.group() + '\n</body>')
page.write_text(html, encoding='utf-8')
