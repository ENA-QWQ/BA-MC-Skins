import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Octokit } from '@octokit/rest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SKINS_DIR = path.join(ROOT, 'skins');
const CONFIG_PATH = path.join(ROOT, 'site.config.json');

function buildId(game, character, variant) {
    const raw = `${game}_${character}_${variant}`;
    return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function getConfig() {
    try {
        const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return { defaultVariant: 'Default' };
    }
}

async function main() {
    const config = await getConfig();
    const defaultVariant = config.defaultVariant || 'Default';

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('GITHUB_TOKEN environment variable is required');
        process.exit(1);
    }

    const octokit = new Octokit({ auth: token });

    const repoOwner = config.repoOwner;
    const repoName = config.repoName;
    if (!repoOwner || !repoName) {
        console.error('repoOwner and repoName must be set in site.config.json');
        process.exit(1);
    }

    const skinIds = [];

    try {
        const gameDirs = await fs.readdir(SKINS_DIR);
        for (const game of gameDirs) {
            const gamePath = path.join(SKINS_DIR, game);
            const stat = await fs.stat(gamePath);
            if (!stat.isDirectory()) continue;

            const entries = await fs.readdir(gamePath, { withFileTypes: true });
            for (const entry of entries) {
                const entryPath = path.join(gamePath, entry.name);
                if (entry.isFile() && entry.name.endsWith('.png')) {
                    const character = path.basename(entry.name, '.png');
                    const variant = defaultVariant;
                    skinIds.push(buildId(game, character, variant));
                } else if (entry.isDirectory()) {
                    const character = entry.name;
                    const files = await fs.readdir(entryPath);
                    for (const file of files) {
                        if (!file.endsWith('.png')) continue;
                        const variant = path.basename(file, '.png');
                        skinIds.push(buildId(game, character, variant));
                    }
                }
            }
        }
    } catch (err) {
        console.error('Failed to scan skins directory:', err);
        process.exit(1);
    }

    if (skinIds.length === 0) {
        console.log('No skins found.');
        return;
    }

    for (const skinId of skinIds) {
        try {
            const { data: issues } = await octokit.issues.listForRepo({
                owner: repoOwner,
                repo: repoName,
                labels: `skin:${skinId}`,
                state: 'all',
                per_page: 1,
            });

            if (issues.length > 0) {
                console.log(`Issue already exists for skin ${skinId}`);
                continue;
            }

            console.log(`Creating issue for skin ${skinId}`);
            await octokit.issues.create({
                owner: repoOwner,
                repo: repoName,
                title: `[Skin] ${skinId}`,
                body: `Skin ID: ${skinId}`,
                labels: [`skin:${skinId}`],
            });
            console.log(`Created issue for skin ${skinId}`);
        } catch (err) {
            console.error(`Failed to process skin ${skinId}:`, err.message);
        }
    }
}

main();