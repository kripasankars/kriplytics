const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

const SIZES = {
    logo: { width: 160, height: 40 },
    banner: { width: 1920, height: 1080 },
    service: { width: 800, height: 600 },
    client: { width: 200, height: 60 }
};

const COLORS = {
    logo: { r: 0, g: 123, b: 255 },
    banner: { r: 41, g: 128, b: 185 },
    services: [
        { r: 39, g: 174, b: 96 },
        { r: 142, g: 68, b: 173 },
        { r: 211, g: 84, b: 0 }
    ],
    client: { r: 44, g: 62, b: 80 }
};

async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

async function createPlaceholder(options) {
    const { width, height, color, text, outputPath } = options;
    
    await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: color.r, g: color.g, b: color.b, alpha: 1 }
        }
    })
    .composite([{
        input: {
            text: {
                text: text || `${width}x${height}`,
                font: 'Arial',
                fontSize: Math.min(width, height) / 8,
                rgba: true
            }
        },
        gravity: 'center'
    }])
    .png()
    .toFile(outputPath);
}

async function main() {
    try {
        console.log(chalk.blue('\n🎨 Creating placeholder images...'));

        // Ensure directories exist
        await Promise.all([
            ensureDir('images'),
            ensureDir('images/services'),
            ensureDir('images/clients'),
            ensureDir('images/banner')
        ]);

        // Create logo
        await createPlaceholder({
            ...SIZES.logo,
            color: COLORS.logo,
            text: 'KRIPLYTICS',
            outputPath: 'images/kriplytics-logo.png'
        });
        console.log(chalk.green('✓ Created logo'));

        // Create banner
        await createPlaceholder({
            ...SIZES.banner,
            color: COLORS.banner,
            text: 'AWS SECURITY',
            outputPath: 'images/banner/aws-security-banner.jpg'
        });
        console.log(chalk.green('✓ Created banner'));

        // Create service images
        const services = ['zero-trust-security', 'cost-optimization', 'monitoring'];
        await Promise.all(services.map((service, index) => 
            createPlaceholder({
                ...SIZES.service,
                color: COLORS.services[index],
                text: service.toUpperCase(),
                outputPath: `images/services/${service}-original.jpg`
            })
        ));
        console.log(chalk.green('✓ Created service images'));

        // Create client logos
        const clients = ['fintech-corp', 'healthtech-solutions', 'ecommerce-plus', 'tech-innovators'];
        await Promise.all(clients.map(client => 
            createPlaceholder({
                ...SIZES.client,
                color: COLORS.client,
                text: client.toUpperCase(),
                outputPath: `images/clients/${client}-original.png`
            })
        ));
        console.log(chalk.green('✓ Created client logos'));

        console.log(chalk.green('\n✨ All placeholder images created successfully!'));
        
    } catch (error) {
        console.error(chalk.red('\n❌ Error creating placeholder images:'), error);
        process.exit(1);
    }
}

main(); 