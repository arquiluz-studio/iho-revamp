#!/usr/bin/env python3
"""Convert IHO site/index.html to Next.js globals.css + page-body.tsx"""
import re
import html as html_lib
import sys

with open('/Users/hugo/Desktop/iho_prop/site/index.html', 'r', encoding='utf-8') as f:
    src = f.read()

# ── 1. Extract CSS from <style> blocks ──────────────────────────────────────
style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', src, re.DOTALL)
css_content = '\n'.join(style_blocks)

# ── 2. Extract body HTML ────────────────────────────────────────────────────
# Body is everything inside the outer <div style="width: 100%; overflow-x: hidden">
body_match = re.search(
    r'<div style="width: 100%; overflow-x: hidden">(.*?)</div>\s*\n?\s*<script\s+type="text/x-dc"',
    src, re.DOTALL
)
if not body_match:
    # fallback: grab from first big div to the DC script
    body_match = re.search(
        r'(<div style="width: 100%; overflow-x: hidden">.*)',
        src, re.DOTALL
    )
    body_html = body_match.group(1) if body_match else ''
    # Remove DC script and everything after
    body_html = re.sub(r'<script\s+type="text/x-dc".*', '', body_html, flags=re.DOTALL)
    # Remove closing </div> at the very end
    body_html = body_html.rstrip()
    if body_html.endswith('</div>'):
        body_html = body_html[:-6]
else:
    body_html = body_match.group(1)

# ── 3. HTML → JSX attribute conversions ────────────────────────────────────

def css_prop_to_camel(prop):
    prop = prop.strip()
    parts = prop.split('-')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])

def style_str_to_jsx(style_str):
    """Convert a CSS style string to a JSX style object string."""
    # Collapse whitespace / newlines
    style_str = re.sub(r'\s+', ' ', style_str).strip()
    # Decode HTML entities
    style_str = html_lib.unescape(style_str)

    pairs = []
    # Split on ; but keep track of parens depth to avoid splitting inside url(...) or gradient(...)
    depth = 0
    current = ''
    for ch in style_str:
        if ch == '(':
            depth += 1
            current += ch
        elif ch == ')':
            depth -= 1
            current += ch
        elif ch == ';' and depth == 0:
            pairs.append(current.strip())
            current = ''
        else:
            current += ch
    if current.strip():
        pairs.append(current.strip())

    result_parts = []
    for pair in pairs:
        if not pair:
            continue
        colon_idx = pair.find(':')
        if colon_idx == -1:
            continue
        prop = pair[:colon_idx].strip()
        val = pair[colon_idx+1:].strip()
        if not prop or not val:
            continue
        camel = css_prop_to_camel(prop)
        # Escape single quotes in value
        val_escaped = val.replace("'", "\\'")
        result_parts.append(f"{camel}: '{val_escaped}'")

    return '{{' + ', '.join(result_parts) + '}}'

def convert_style_attr(m):
    """Replace style="..." with style={{...}}"""
    val = m.group(1)
    jsx_obj = style_str_to_jsx(val)
    return f'style={jsx_obj}'

def convert_onclick(m):
    val = m.group(1).strip()
    # Handle common patterns
    if val.startswith('ihoCarousel('):
        args = val[len('ihoCarousel('):-1]
        return f'onClick={{() => (window as any).ihoCarousel({args})}}'
    if 'event.preventDefault()' in val:
        return f'onSubmit={{(e) => e.preventDefault()}}'
    # Generic fallback
    safe = val.replace('"', '\\"').replace("'", "\\'")
    return f'onClick={{() => {{ {safe} }}}}'

def convert_onmouseover(m):
    val = m.group(1).strip()
    if 'this.style.opacity' in val:
        op = re.search(r'=\s*([0-9.]+)', val)
        if op:
            return f'onMouseOver={{(e) => {{ (e.currentTarget as HTMLElement).style.opacity = \'{op.group(1)}\' }}}}'
    safe = val.replace('"', '\\"')
    return f'onMouseOver={{() => {{ {safe} }}}}'

def convert_onmouseout(m):
    val = m.group(1).strip()
    if 'this.style.opacity' in val:
        op = re.search(r'=\s*([0-9.]+)', val)
        if op:
            return f'onMouseOut={{(e) => {{ (e.currentTarget as HTMLElement).style.opacity = \'{op.group(1)}\' }}}}'
    safe = val.replace('"', '\\"')
    return f'onMouseOut={{() => {{ {safe} }}}}'

def convert_onload(m):
    val = m.group(1).strip()
    if 'this.style.opacity' in val:
        op = re.search(r'=\s*([0-9.]+)', val)
        if op:
            return f'onLoad={{(e) => {{ (e.currentTarget as HTMLIFrameElement).style.opacity = \'{op.group(1)}\' }}}}'
    return f'onLoad={{() => {{}}}}'

jsx = body_html

# ── Step 1: Fix void elements FIRST (while HTML has no > in attribute values)
void_elements = ['input', 'br', 'hr', 'img', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr']
for tag in void_elements:
    # Match the full opening tag (greedy up to >) and ensure it's not already self-closing
    jsx = re.sub(rf'(<{tag}(?:\s[^>]*)?[^/])>', r'\1 />', jsx)

# ── Step 2: Convert event attributes
# onclick
jsx = re.sub(r'\bonclick="([^"]*)"', convert_onclick, jsx)
# onmouseover / onmouseout
jsx = re.sub(r'\bonmouseover="([^"]*)"', convert_onmouseover, jsx)
jsx = re.sub(r'\bonmouseout="([^"]*)"', convert_onmouseout, jsx)
# onload
jsx = re.sub(r'\bonload="([^"]*)"', convert_onload, jsx)
# onsubmit
jsx = re.sub(r'\bonsubmit="([^"]*)"', lambda m: 'onSubmit={(e) => e.preventDefault()}', jsx)

# ── Step 3: Convert style="..." — handle multi-line style values
jsx = re.sub(
    r'style="\s*((?:[^"\\]|\\.)*?)\s*"',
    convert_style_attr,
    jsx,
    flags=re.DOTALL
)

# class → className
jsx = re.sub(r'\bclass="', 'className="', jsx)
# for → htmlFor
jsx = re.sub(r'\bfor="', 'htmlFor="', jsx)
# tabindex → tabIndex
jsx = re.sub(r'\btabindex="', 'tabIndex="', jsx)
# aria-expanded keeps as-is (already JSX compatible)
# crossorigin → crossOrigin
jsx = re.sub(r'\bcrossorigin="', 'crossOrigin="', jsx)

# Fix src paths — assets/ → /
jsx = re.sub(r'src="assets/', 'src="/', jsx)
jsx = re.sub(r'src="assets/mapa-latam\.html"', 'src="/mapa-latam.html"', jsx)

# HTML comments → JSX comments
jsx = re.sub(r'<!--(.*?)-->', lambda m: '{/*' + m.group(1) + '*/}', jsx, flags=re.DOTALL)

# Remove <helmet> wrapper tags (they're not real HTML)
jsx = re.sub(r'</?helmet>', '', jsx)

# Remove inline <style> blocks (CSS goes to globals.css)
jsx = re.sub(r'<style[^>]*>.*?</style>', '', jsx, flags=re.DOTALL)

# Remove inline <script> blocks (JS goes to useEffect)
# But keep track of their content first
script_blocks = re.findall(r'<script(?:\s[^>]*)?>(?!.*?text/x-dc)(.*?)</script>', jsx, re.DOTALL)
jsx = re.sub(r'<script(?:\s[^>]*)?>.*?</script>', '', jsx, flags=re.DOTALL)

# Fix &quot; remaining in JSX text content
jsx = re.sub(r'&quot;', '"', jsx)
jsx = re.sub(r'&amp;', '&', jsx)
jsx = re.sub(r'&lt;', '<', jsx)
jsx = re.sub(r'&gt;', '>', jsx)

print('=== CSS ===')
print(css_content[:200])
print('...')
print(f'CSS length: {len(css_content)} chars')
print()
print(f'JSX body length: {len(jsx)} chars')
print(f'Script blocks found: {len(script_blocks)}')

# Write outputs
with open('/Users/hugo/Desktop/iho-web/app/globals-body.css', 'w') as f:
    f.write(css_content)
print('Written: globals-body.css')

with open('/Users/hugo/Desktop/iho-web/app/page-body.tsx', 'w') as f:
    f.write(jsx)
print('Written: page-body.tsx')

# Write JS blocks for reference
with open('/Users/hugo/Desktop/iho-web/app/_scripts.js', 'w') as f:
    for i, block in enumerate(script_blocks):
        f.write(f'// === Script block {i+1} ===\n')
        f.write(block.strip())
        f.write('\n\n')
print(f'Written: _scripts.js ({len(script_blocks)} blocks)')
