import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const baseSha = process.env.BASE_SHA;
const headSha = process.env.HEAD_SHA;

console.log(`Comparing ${baseSha} to ${headSha}`);

let allChanges = '';
try {
    allChanges = execSync(`git diff --name-only ${baseSha} ${headSha}`).toString().trim();
    console.log('All changed files:', allChanges);
} catch (e) {
    console.error('Git diff failed:', e.message);
    process.exit(1);
}

if (!allChanges) {
    console.log('No changes detected at all.');
    process.exit(0);
}

let diffOutput = '';
try {
    diffOutput = execSync(`git diff --name-only ${baseSha} ${headSha} -- 'skins/**/*.png'`).toString().trim();
} catch (e) {
    console.error('Filtering for skins failed:', e.message);
    process.exit(0);
}

console.log('Skin changes detected:', diffOutput || 'None');

if (!diffOutput) {
    console.log('No skin changes detected, skipping comment.');
    fs.writeFileSync('/tmp/pr_comment.md', '');
    process.exit(0);
}

const changedFiles = diffOutput.split('\n');
let commentBody = '### Skin Visual Diff\n\n';

for (const file of changedFiles) {
    if (!fs.existsSync(file)) {
        console.warn(`File not found: ${file}`);
        continue;
    }

    const fileName = path.basename(file);
    let oldPath = null;

    try {
        execSync(`git cat-file -e ${baseSha}:${file}`, { stdio: 'ignore' });
        oldPath = `/tmp/old_${fileName}`;
        execSync(`git show ${baseSha}:${file} > ${oldPath}`);
    } catch (e) {
        console.log(`New file detected: ${file}`);
    }

    const diffPath = `/tmp/diff_${fileName}.png`;

    try {
        if (oldPath) {
            execSync(`convert "${oldPath}" "${file}" +append "${diffPath}"`);
        } else {
            fs.copyFileSync(file, diffPath);
        }

        const buffer = fs.readFileSync(diffPath);
        const base64 = buffer.toString('base64');

        commentBody += `**${file}**\n`;
        commentBody += `![${fileName}](data:image/png;base64,${base64})\n\n`;
    } catch (err) {
        console.error(`Failed to process diff for ${file}:`, err.message);
        commentBody += `**${file}** (Diff generation failed)\n\n`;
    }
}

fs.writeFileSync('/tmp/pr_comment.md', commentBody);
console.log('Comment body written to /tmp/pr_comment.md');