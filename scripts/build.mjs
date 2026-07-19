import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const SKINS_DIR = path.join(process.cwd(), 'skins');
const DIST_DIR = path.join(process.cwd(), 'dist');

const REPO_OWNER = 'ENA-QWQ';
const REPO_NAME = 'BA-MC-Skins';
const BRANCH = 'main';

async function calculateSha256(filePath) {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function processSkin(character, variant, inputPath) {
    const fileName = path.basename(inputPath, '.png');
    const sha256 = await calculateSha256(inputPath);

    const downloadUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/skins/${character}/${fileName}.png`;

    return {
        id: `${character}_${variant}`,
        character,
        variant,
        downloadUrl,
        sha256
    };
}

async function build() {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
    await fs.mkdir(DIST_DIR, { recursive: true });

    const characters = await fs.readdir(SKINS_DIR);
    const manifest = [];
    const tasks = [];

    for (const character of characters) {
        const charDir = path.join(SKINS_DIR, character);
        const stat = await fs.stat(charDir);
        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(charDir);
        for (const file of files) {
            if (file.endsWith('.png')) {
                const variant = path.basename(file, '.png');
                const inputPath = path.join(charDir, file);
                tasks.push(processSkin(character, variant, inputPath));
            }
        }
    }

    const results = await Promise.all(tasks);
    manifest.push(...results);

    await fs.writeFile(
        path.join(DIST_DIR, 'data.json'),
        JSON.stringify(manifest, null, 2)
    );

    console.log(`Build complete. Processed ${manifest.length} skins.`);
}

build().catch(console.error);