import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createCanvas, Image } from 'canvas';
import { JSDOM } from 'jsdom';
import { SkinViewer } from 'skinview3d';
import * as THREE from 'three';

const SKINS_DIR = path.join(process.cwd(), 'skins');
const DIST_DIR = path.join(process.cwd(), 'dist');
const PREVIEWS_DIR = path.join(DIST_DIR, 'previews');

const REPO_OWNER = 'ENA-QWQ';
const REPO_NAME = 'BA-MC-Skins';
const BRANCH = 'main';

async function calculateSha256(filePath) {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function generateIsometricPreview(inputPath, outputPath) {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    global.Image = Image;

    const width = 256;
    const height = 256;
    const canvas = createCanvas(width, height);

    const viewer = new SkinViewer({
        canvas: canvas,
        width: width,
        height: height,
        skin: inputPath,
    });

    viewer.autoRotate = false;
    viewer.playerObject.rotation.set(
        THREE.MathUtils.degToRad(30),
        THREE.MathUtils.degToRad(45),
        0
    );

    viewer.render();
    const buffer = canvas.toBuffer('image/webp', { quality: 80 });
    await fs.writeFile(outputPath, buffer);
    viewer.dispose();
}

async function processSkin(character, variant, inputPath) {
    const fileName = path.basename(inputPath, '.png');
    const sha256 = await calculateSha256(inputPath);
    const previewFileName = `${character}_${variant}.webp`;
    const previewPath = path.join(PREVIEWS_DIR, previewFileName);

    await generateIsometricPreview(inputPath, previewPath);

    const downloadUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/skins/${character}/${fileName}.png`;
    const previewUrl = `/previews/${previewFileName}`;

    return {
        id: `${character}_${variant}`,
        character,
        variant,
        previewUrl,
        downloadUrl,
        sha256
    };
}

async function build() {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
    await fs.mkdir(PREVIEWS_DIR, { recursive: true });

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