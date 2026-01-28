/**
 * Script para generar íconos PWA y favicon desde el logo
 * Ejecutar: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_LOGO = path.join(__dirname, '../assets/logo/logo-icono.png');
const ICONS_DIR = path.join(__dirname, '../assets/icons');

// Tamaños para PWA (manifest.json)
const PWA_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Tamaños para favicon (multi-resolución)
const FAVICON_SIZES = [16, 32, 48];

async function generateIcons() {
    console.log('🎨 Generando íconos PWA y favicon desde logo-icono.png...\n');

    // Verificar que el logo existe
    if (!fs.existsSync(SOURCE_LOGO)) {
        console.error('❌ Error: No se encontró el logo en:', SOURCE_LOGO);
        process.exit(1);
    }

    // Crear directorio de íconos si no existe
    if (!fs.existsSync(ICONS_DIR)) {
        fs.mkdirSync(ICONS_DIR, { recursive: true });
    }

    // Obtener información del logo original
    const logoInfo = await sharp(SOURCE_LOGO).metadata();
    console.log(`📷 Logo original: ${logoInfo.width}x${logoInfo.height}px\n`);

    // Generar íconos PWA
    console.log('📱 Generando íconos PWA...');
    for (const size of PWA_SIZES) {
        const outputPath = path.join(ICONS_DIR, `icon-${size}.png`);

        await sharp(SOURCE_LOGO)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toFile(outputPath);

        console.log(`   ✅ icon-${size}.png`);
    }

    // Generar favicon.png (32x32 principal)
    console.log('\n🌐 Generando favicon...');
    const faviconPath = path.join(__dirname, '../favicon.png');
    await sharp(SOURCE_LOGO)
        .resize(32, 32, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(faviconPath);
    console.log('   ✅ favicon.png (32x32)');

    // Generar favicon-16.png para browsers que lo necesiten
    const favicon16Path = path.join(__dirname, '../favicon-16.png');
    await sharp(SOURCE_LOGO)
        .resize(16, 16, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(favicon16Path);
    console.log('   ✅ favicon-16.png (16x16)');

    // Generar apple-touch-icon (180x180 para iOS)
    console.log('\n🍎 Generando apple-touch-icon...');
    const appleTouchPath = path.join(__dirname, '../apple-touch-icon.png');
    await sharp(SOURCE_LOGO)
        .resize(180, 180, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 } // Fondo blanco para iOS
        })
        .png()
        .toFile(appleTouchPath);
    console.log('   ✅ apple-touch-icon.png (180x180)');

    console.log('\n✨ ¡Todos los íconos generados exitosamente!');
    console.log('\n📋 Archivos creados:');
    console.log('   - assets/icons/icon-{72,96,128,144,152,192,384,512}.png');
    console.log('   - favicon.png');
    console.log('   - favicon-16.png');
    console.log('   - apple-touch-icon.png');
}

generateIcons().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
