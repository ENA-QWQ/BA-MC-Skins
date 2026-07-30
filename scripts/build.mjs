import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SKINS_DIR = path.join(ROOT, 'skins');
const PUBLIC_DIR = path.join(ROOT, 'public');
const CONFIG_PATH = path.join(ROOT, 'site.config.json');

let config = {
    repoOwner: 'unknown',
    repoName: 'unknown',
    branch: 'main',
    defaultVariant: 'Default',
};

try {
    const configRaw = await fs.readFile(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(configRaw);
    config.repoOwner = parsed.repoOwner || config.repoOwner;
    config.repoName = parsed.repoName || config.repoName;
    config.branch = parsed.branch || config.branch;
    config.defaultVariant = parsed.defaultVariant || config.defaultVariant;
} catch (err) {
    console.warn('Warning: site.config.json missing or invalid, using defaults.');
}

function getGitAuthor(filePath) {
    try {
        const relative = path.relative(ROOT, filePath);
        const author = execSync(`git log --follow --format=%an -1 -- "${relative}"`, {
            encoding: 'utf-8',
            cwd: ROOT,
        }).trim();
        return author || 'Unknown';
    } catch {
        return 'Unknown';
    }
}

async function calculateSha256(filePath) {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function buildId(game, character, variant) {
    const raw = `${game}_${character}_${variant}`;
    return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function readMetaFile(metaPath) {
    return fs.readFile(metaPath, 'utf-8').then(JSON.parse).catch(() => null);
}

async function processSkinFile(filePath, game, character, variant, meta) {
    const stat = await fs.stat(filePath);
    const sha256 = await calculateSha256(filePath);
    const gitAuthor = getGitAuthor(filePath);

    let isOriginal = true;
    let originalAuthor = null;
    let originalSource = null;
    let license = null;
    let note = null;

    if (meta) {
        originalAuthor = meta.originalAuthor || null;
        originalSource = meta.originalSource || null;
        license = meta.license || null;
        note = meta.note || null;
        if (typeof meta.isOriginal === 'boolean') {
            isOriginal = meta.isOriginal;
        } else {
            isOriginal = !originalSource;
        }
    } else {
        isOriginal = true;
    }

    let author = gitAuthor;
    if (!isOriginal && originalAuthor) {
        author = originalAuthor;
    } else if (isOriginal && !originalAuthor) {
        originalAuthor = gitAuthor;
    }

    const downloadUrl = `https://raw.githubusercontent.com/${config.repoOwner}/${config.repoName}/${config.branch}/skins/${game}/${character}${variant ? '/' + variant : ''}.png`;

    return {
        id: buildId(game, character, variant),
        game,
        character,
        variant,
        downloadUrl,
        sha256,
        createdAt: stat.birthtime.toISOString(),
        updatedAt: stat.mtime.toISOString(),
        author,
        isOriginal,
        originalAuthor,
        originalSource,
        license,
        note,
    };
}

async function build() {
    await fs.mkdir(PUBLIC_DIR, { recursive: true });

    const gameDirs = await fs.readdir(SKINS_DIR).catch(() => []);
    const manifest = [];

    for (const game of gameDirs) {
        const gamePath = path.join(SKINS_DIR, game);
        const gameStat = await fs.stat(gamePath);
        if (!gameStat.isDirectory()) continue;

        const entries = await fs.readdir(gamePath, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(gamePath, entry.name);

            if (entry.isFile() && entry.name.endsWith('.png')) {
                const character = path.basename(entry.name, '.png');
                const variant = config.defaultVariant;
                const metaPath = path.join(gamePath, `${variant}.meta.json`);
                const meta = await readMetaFile(metaPath);
                const skin = await processSkinFile(entryPath, game, character, variant, meta);
                manifest.push(skin);
            } else if (entry.isDirectory()) {
                const character = entry.name;
                const charPath = entryPath;
                const files = await fs.readdir(charPath);
                for (const file of files) {
                    if (!file.endsWith('.png')) continue;
                    const variant = path.basename(file, '.png');
                    const filePath = path.join(charPath, file);
                    const metaPath = path.join(charPath, `${variant}.meta.json`);
                    const meta = await readMetaFile(metaPath);
                    const skin = await processSkinFile(filePath, game, character, variant, meta);
                    manifest.push(skin);
                }
            } else {
                console.warn(`Ignored unexpected entry: ${entryPath} (depth 1 or >3)`);
            }
        }
    }

    await fs.writeFile(
        path.join(PUBLIC_DIR, 'data.json'),
        path.join(DIST_DIR, 'data.json'),
        JSON.stringify(manifest, null, 2)
    );

    console.log(`Build complete. Processed ${manifest.length} skins.`);
}

build().catch(console.error);