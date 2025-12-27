#!/usr/bin/env node
/**
 * Generer PNG-ikoner fra SVG for SykePriser.app
 *
 * Krav: npm install sharp
 *
 * Kjør: node generate_icons.js
 */

const fs = require('fs');
const path = require('path');

let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.error('❌ Mangler avhengigheter!');
    console.error('\nInstaller med:');
    console.error('  npm install sharp');
    console.error('\nEller bruk online verktøy:');
    console.error('  https://cloudconvert.com/svg-to-png');
    process.exit(1);
}

async function svgToPng(svgPath, pngPath, size) {
    try {
        await sharp(svgPath)
            .resize(size, size)
            .png()
            .toFile(pngPath);
        console.log(`✅ Genererte: ${pngPath} (${size}x${size})`);
    } catch (error) {
        console.error(`❌ Feil ved generering av ${pngPath}:`, error.message);
        throw error;
    }
}

async function main() {
    const publicDir = path.join(__dirname, 'public');
    const svgPath = path.join(publicDir, 'icon.svg');

    if (!fs.existsSync(svgPath)) {
        console.error(`❌ Finner ikke ${svgPath}`);
        process.exit(1);
    }

    // Generer ikoner
    await svgToPng(svgPath, path.join(publicDir, 'icon.png'), 192);
    await svgToPng(svgPath, path.join(publicDir, 'icon-512.png'), 512);

    console.log('\n🎉 Ikoner generert! Klar til deploy.');
}

main().catch(error => {
    console.error('❌ Feil:', error);
    process.exit(1);
});
