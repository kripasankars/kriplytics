const sharp = require('sharp');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs').promises;
const chalk = require('chalk');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .option('cleanup', {
        alias: 'c',
        type: 'boolean',
        description: 'Clean up generated images before processing'
    })
    .option('optimize', {
        alias: 'o',
        type: 'boolean',
        description: 'Generate optimized images after cleanup'
    })
    .help()
    .argv;

const QUALITY = {
    small: 75,
    medium: 85,
    large: 90,
    webp: 80,
    avif: 70
};

const SIZES = {
    logo: {
        regular: { width: 160, height: 40 },
        retina: { width: 320, height: 80 }
    },
    services: {
        small: { width: 400, height: 300 },
        medium: { width: 800, height: 600 },
        large: { width: 1200, height: 900 }
    },
    clients: {
        regular: { width: 200, height: 60 },
        retina: { width: 400, height: 120 }
    }
};

// Patterns for generated files
const GENERATED_PATTERNS = {
    logo: [
        'images/kriplytics-logo.{png,webp,avif}',
        'images/kriplytics-logo@2x.{png,webp,avif}'
    ],
    services: [
        'images/services/*-small.{jpg,webp,avif}',
        'images/services/*[!-original].{jpg,webp,avif}',
        'images/services/*-large.{jpg,webp,avif}'
    ],
    clients: [
        'images/clients/*[!-original].{png,webp,avif}',
        'images/clients/*@2x.{png,webp,avif}'
    ]
};

async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

async function cleanup() {
    console.log(chalk.yellow('\n🧹 Cleaning up generated images...'));
    
    const patterns = [
        ...GENERATED_PATTERNS.logo,
        ...GENERATED_PATTERNS.services,
        ...GENERATED_PATTERNS.clients
    ];
    
    for (const pattern of patterns) {
        const files = await glob(pattern);
        for (const file of files) {
            try {
                await fs.unlink(file);
                console.log(chalk.gray(`  Removed: ${file}`));
            } catch (err) {
                console.warn(chalk.yellow(`  Warning: Could not remove ${file}`));
            }
        }
    }
    
    console.log(chalk.green('✓ Cleanup complete'));
}

async function processLogo(inputPath) {
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, '.png');
    
    for (const [size, dimensions] of Object.entries(SIZES.logo)) {
        const suffix = size === 'regular' ? '' : '@2x';
        
        // Generate PNG
        await sharp(inputPath)
            .resize(dimensions.width, dimensions.height)
            .png({ quality: QUALITY[size === 'regular' ? 'medium' : 'large'] })
            .toFile(path.join(dir, `${name}${suffix}.png`));
        
        // Generate WebP
        await sharp(inputPath)
            .resize(dimensions.width, dimensions.height)
            .webp({ quality: QUALITY.webp })
            .toFile(path.join(dir, `${name}${suffix}.webp`));
        
        // Generate AVIF
        await sharp(inputPath)
            .resize(dimensions.width, dimensions.height)
            .avif({ quality: QUALITY.avif })
            .toFile(path.join(dir, `${name}${suffix}.avif`));
    }
}

async function processServiceImage(inputPath) {
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, '.jpg');
    
    for (const [size, dimensions] of Object.entries(SIZES.services)) {
        const suffix = size === 'medium' ? '' : `-${size}`;
        
        // Generate JPEG
        await sharp(inputPath)
            .resize(dimensions.width, dimensions.height)
            .jpeg({ quality: QUALITY[size], progressive: true })
            .toFile(path.join(dir, `${name}${suffix}.jpg`));
        
        // Generate WebP
        await sharp(inputPath)
            .resize(dimensions.width, dimensions.height)
            .webp({ quality: QUALITY.webp })
            .toFile(path.join(dir, `${name}${suffix}.webp`));
        
        // Generate AVIF
        await sharp(inputPath)
            .resize(dimensions.width, dimensions.height)
            .avif({ quality: QUALITY.avif })
            .toFile(path.join(dir, `${name}${suffix}.avif`));
    }
}

async function processClientLogo(inputPath) {
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, '.png');
    
    for (const [size, dimensions] of Object.entries(SIZES.clients)) {
        const suffix = size === 'regular' ? '' : '@2x';
        
        // Generate PNG
        await sharp(inputPath)
            .resize(dimensions.width, dimensions.height)
            .png({ quality: QUALITY[size === 'regular' ? 'medium' : 'large'] })
            .toFile(path.join(dir, `${name}${suffix}.png`));
        
        // Generate WebP
        await sharp(inputPath)
            .resize(dimensions.width, dimensions.height)
            .webp({ quality: QUALITY.webp })
            .toFile(path.join(dir, `${name}${suffix}.webp`));
        
        // Generate AVIF
        await sharp(inputPath)
            .resize(dimensions.width, dimensions.height)
            .avif({ quality: QUALITY.avif })
            .toFile(path.join(dir, `${name}${suffix}.avif`));
    }
}

async function optimizeImages() {
    console.log(chalk.blue('\n🖼  Processing images...'));
    
    // Process logo
    const logoPath = 'images/kriplytics-logo.png';
    if (await fs.access(logoPath).then(() => true).catch(() => false)) {
        await processLogo(logoPath);
        console.log(chalk.green('✓ Logo processed'));
    }

    // Process service images
    const serviceImages = await glob('images/services/*-original.jpg');
    for (const image of serviceImages) {
        await processServiceImage(image);
        console.log(chalk.green(`✓ Processed service image: ${path.basename(image)}`));
    }

    // Process client logos
    const clientLogos = await glob('images/clients/*-original.png');
    for (const logo of clientLogos) {
        await processClientLogo(logo);
        console.log(chalk.green(`✓ Processed client logo: ${path.basename(logo)}`));
    }

    console.log(chalk.green('\n✨ All images processed successfully!'));
}

async function main() {
    try {
        // Ensure directories exist
        await Promise.all([
            ensureDir('images/services'),
            ensureDir('images/clients')
        ]);

        if (argv.cleanup) {
            await cleanup();
            if (!argv.optimize) {
                return;
            }
        }

        if (argv.cleanup || !argv.cleanup) {
            await optimizeImages();
        }
        
    } catch (error) {
        console.error(chalk.red('\n❌ Error processing images:'), error);
        process.exit(1);
    }
}

main(); 