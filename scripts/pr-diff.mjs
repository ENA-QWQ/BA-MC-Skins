import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const baseSha = process.env.BASE_SHA;
const headSha = process.env.HEAD_SHA;

let diffOutput = '';
try {
    diffOutput = execSync(`git diff --name-only ${baseSha} ${headSha} -- 'skins/**/*.png'`).toString().trim();
} catch (e) {
    process.exit(0);
}

if (!diffOutput) {
    console.log('No skin changes detected.');
    process.exit(0);
}

const changedFiles = diffOutput.split('\n');
let commentBody = '### Skin Visual Diff\n\n';

for (const file of changedFiles) {
    if (!fs.existsSync(file)) continue;

    const fileName = path.basename(file);
    let oldPath = null;

    try {
        execSync(`git cat-file -e ${baseSha}:${file}`, { stdio: 'ignore' });
        oldPath = `/tmp/old_${fileName}`;
        execSync(`git show ${baseSha}:${file} > ${oldPath}`);
    } catch (e) {}

    const diffPath = `/tmp/diff_${fileName}.png`;
    if (oldPath) {
        execSync(`convert "${oldPath}" "${file}" +append "${diffPath}"`);
    } else {
        fs.copyFileSync(file, diffPath);
    }

    const buffer = fs.readFileSync(diffPath);
    const base64 = buffer.toString('base64');

    commentBody += `**${file}**\n`;
    commentBody += `![${fileName}](data:image/png;base64,${base64})\n\n`;
}

fs.writeFileSync('/tmp/pr_comment.md', commentBody);