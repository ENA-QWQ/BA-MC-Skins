import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const baseSha = process.env.BASE_SHA;
const headSha = process.env.HEAD_SHA;
const scale = 4;

let diffOutput = '';
try {
    diffOutput = execSync(`git diff --name-only ${baseSha} ${headSha} -- 'skins/**/*.png'`).toString().trim();
} catch (e) {
    process.exit(0);
}

if (!diffOutput) {
    process.exit(0);
}

const changedFiles = diffOutput.split('\n');
let commentBody = '### Skin Visual Diff\n\n';
commentBody += '> Red areas indicate modified pixels.\n\n';

for (const file of changedFiles) {
    if (!fs.existsSync(file)) continue;

    const fileName = path.basename(file);
    let oldPath = null;

    try {
        execSync(`git cat-file -e ${baseSha}:${file}`, { stdio: 'ignore' });
        oldPath = `/tmp/old_${fileName}`;
        execSync(`git show ${baseSha}:${file} > ${oldPath}`);
    } catch (e) {}

    const finalPath = `/tmp/final_${fileName}.png`;

    try {
        let command;
        if (oldPath) {
            const maskPath = `/tmp/mask_${fileName}.png`;
            const scaledNew = `/tmp/scaled_new_${fileName}.png`;

            command = [
                `convert "${file}" -scale ${scale}x${scale}! "${scaledNew}"`,
                `convert "${oldPath}" -scale ${scale}x${scale}! "${file}" -scale ${scale}x${scale}! -compose difference -composite -threshold 0 -negate "${maskPath}"`,
                `convert "${maskPath}" -fill "rgba(255,0,0,0.6)" -opaque white -transparent black "${maskPath}"`,
                `convert "${scaledNew}" "${maskPath}" -compose over -composite "${finalPath}"`
            ].join(' && ');
        } else {
            command = `convert "${file}" -scale ${scale}x${scale}! "${finalPath}"`;
        }
        execSync(command);

        const buffer = fs.readFileSync(finalPath);
        const base64 = buffer.toString('base64');

        commentBody += `**${file}**\n`;
        commentBody += `![${fileName}](data:image/png;base64,${base64})\n\n`;
    } catch (err) {
        console.error(`Failed to process diff for ${file}:`, err.message);
    }
}

fs.writeFileSync('pr_comment.md', commentBody);
console.log('Comment body written to pr_comment.md');