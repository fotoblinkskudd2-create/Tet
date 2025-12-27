#!/usr/bin/env python3
"""
Generer PNG-ikoner fra SVG for SykePriser.app

Krav: pip install cairosvg pillow

Kjør: python generate_icons.py
"""

import os
import sys

try:
    import cairosvg
    from PIL import Image
    import io
except ImportError:
    print("❌ Mangler avhengigheter!")
    print("\nInstaller med:")
    print("  pip install cairosvg pillow")
    print("\nEller bruk online verktøy:")
    print("  https://cloudconvert.com/svg-to-png")
    sys.exit(1)

def svg_to_png(svg_path, png_path, size):
    """Konverter SVG til PNG med gitt størrelse"""
    # Les SVG
    with open(svg_path, 'rb') as f:
        svg_data = f.read()

    # Konverter SVG til PNG bytes
    png_data = cairosvg.svg2png(
        bytestring=svg_data,
        output_width=size,
        output_height=size
    )

    # Lagre som PNG
    img = Image.open(io.BytesIO(png_data))
    img.save(png_path, 'PNG')
    print(f"✅ Genererte: {png_path} ({size}x{size})")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(script_dir, 'public')
    svg_path = os.path.join(public_dir, 'icon.svg')

    if not os.path.exists(svg_path):
        print(f"❌ Finner ikke {svg_path}")
        sys.exit(1)

    # Generer ikoner
    svg_to_png(svg_path, os.path.join(public_dir, 'icon.png'), 192)
    svg_to_png(svg_path, os.path.join(public_dir, 'icon-512.png'), 512)

    print("\n🎉 Ikoner generert! Klar til deploy.")

if __name__ == '__main__':
    main()
