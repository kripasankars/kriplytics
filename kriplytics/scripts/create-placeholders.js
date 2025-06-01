const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const chalk = require('chalk');

const SIZES = {
    logo: { width: 320, height: 80 },
    banner: { width: 1920, height: 1080 },
    services: { width: 1200, height: 900 },
    clients: { width: 400, height: 120 }
};

async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

async function createPlaceholder(options) {
    const { width, height, text, outputPath, backgroundColor = '#ffffff', textColor = '#000000' } = options;
    
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="${backgroundColor}"/>
            <text
                x="50%"
                y="50%"
                font-family="Arial"
                font-size="${Math.min(width, height) * 0.1}px"
                fill="${textColor}"
                text-anchor="middle"
                dominant-baseline="middle"
            >${text}</text>
        </svg>
    `;
    
    await sharp(Buffer.from(svg))
        .resize(width, height)
        .toFile(outputPath);
}

async function main() {
    try {
        console.log(chalk.blue('🎨 Creating placeholder images...'));
        
        // Ensure directories exist
        await Promise.all([
            ensureDir('images'),
            ensureDir('images/banner'),
            ensureDir('images/services'),
            ensureDir('images/clients')
        ]);
        
        // Create logo
        await createPlaceholder({
            ...SIZES.logo,
            text: 'Kriplytics Logo',
            outputPath: 'images/kriplytics-logo-original.png',
            backgroundColor: '#003366',
            textColor: '#ffffff'
        });
        console.log(chalk.green('✓ Created logo'));

        // Create banner
        await createPlaceholder({
            ...SIZES.banner,
            text: 'AWS Security Banner',
            outputPath: 'images/banner/aws-security-banner.jpg',
            backgroundColor: '#1a1a1a',
            textColor: '#ffffff'
        });
        console.log(chalk.green('✓ Created banner'));
        
        // Create service images
        const services = [
            { name: 'zero-trust-security', title: 'Zero Trust Security' },
            { name: 'cost-optimization', title: 'Cost Optimization' },
            { name: 'monitoring', title: 'Monitoring' }
        ];
        
        for (const service of services) {
            await createPlaceholder({
                ...SIZES.services,
                text: service.title,
                outputPath: `images/services/${service.name}-original.jpg`,
                backgroundColor: '#f0f0f0'
            });
        }
        console.log(chalk.green('✓ Created service images'));
        
        // Create client logos
        const clients = [
            { name: 'fintech-corp', title: 'FinTech Corp' },
            { name: 'healthtech-solutions', title: 'HealthTech Solutions' },
            { name: 'ecommerce-plus', title: 'eCommerce Plus' },
            { name: 'tech-innovators', title: 'Tech Innovators' }
        ];
        
        for (const client of clients) {
            await createPlaceholder({
                ...SIZES.clients,
                text: client.title,
                outputPath: `images/clients/${client.name}-original.png`,
                backgroundColor: '#e0e0e0'
            });
        }
        console.log(chalk.green('✓ Created client logos'));
        
        console.log(chalk.green('✨ All placeholder images created successfully!'));
        
    } catch (error) {
        console.error(chalk.red('\n❌ Error creating placeholder images:'), error);
        process.exit(1);
    }
}

main(); 