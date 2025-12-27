#!/usr/bin/env python3
"""
Generate placeholder PWA icons
Simple solid color with text - replace with proper designs later
"""

from pathlib import Path

def generate_svg_icon(size: int, output_path: str):
    """Generate a simple SVG icon"""
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Black background -->
  <rect width="{size}" height="{size}" fill="#000000"/>

  <!-- Red fist/power symbol -->
  <g transform="translate({size/2}, {size/2})">
    <!-- Circle -->
    <circle cx="0" cy="0" r="{size * 0.35}" fill="none" stroke="#FF0000" stroke-width="{size * 0.08}"/>

    <!-- Power symbol line -->
    <rect x="{-size * 0.04}" y="{-size * 0.35}" width="{size * 0.08}" height="{size * 0.25}" fill="#FF0000"/>
  </g>

  <!-- Text -->
  <text
    x="50%"
    y="85%"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    font-size="{size * 0.15}"
    font-weight="bold"
    fill="#FF0000">FRIHET</text>
</svg>'''

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(svg_content)
    print(f"Generated {output_path}")

def main():
    public_dir = Path(__file__).parent.parent / 'public'

    # Generate icons
    generate_svg_icon(192, str(public_dir / 'icon-192.svg'))
    generate_svg_icon(512, str(public_dir / 'icon-512.svg'))
    generate_svg_icon(180, str(public_dir / 'apple-touch-icon.svg'))

    print("\n✓ Icon placeholders generated!")
    print("\nFor production, convert SVG to PNG:")
    print("  - Use an online converter (e.g., cloudconvert.com)")
    print("  - Or use ImageMagick: convert icon-512.svg icon-512.png")
    print("\nOr design proper icons at:")
    print("  - https://www.pwabuilder.com/imageGenerator")
    print("  - Figma, Canva, etc.")

if __name__ == '__main__':
    main()
