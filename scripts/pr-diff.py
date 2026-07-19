#!/usr/bin/env python3
import os
import sys
import subprocess
from PIL import Image, ImageChops

base_sha = os.environ.get('BASE_SHA')
head_sha = os.environ.get('HEAD_SHA')
if not base_sha or not head_sha:
    print("Error: BASE_SHA and HEAD_SHA must be set.")
    sys.exit(1)

scale = 4
gap = 10
threshold = 10

try:
    diff_output = subprocess.check_output(
        ['git', 'diff', '--name-only', base_sha, head_sha, '--', 'skins/**/*.png'],
        text=True
    ).strip()
except subprocess.CalledProcessError:
    sys.exit(0)

if not diff_output:
    sys.exit(0)

changed_files = diff_output.split('\n')
diff_images = []

for file_path in changed_files:
    if not os.path.exists(file_path):
        continue

    base_name = os.path.splitext(os.path.basename(file_path))[0]
    old_path = None

    try:
        subprocess.check_call(
            ['git', 'cat-file', '-e', f'{base_sha}:{file_path}'],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        old_path = f'/tmp/old_{base_name}.png'
        with open(old_path, 'wb') as f:
            subprocess.check_call(
                ['git', 'show', f'{base_sha}:{file_path}'],
                stdout=f
            )
    except subprocess.CalledProcessError:
        pass

    output_filename = f'diff_{base_name}.png'
    final_path = f'/tmp/{output_filename}'

    try:
        img_new = Image.open(file_path).convert('RGBA')

        if old_path:
            img_old = Image.open(old_path).convert('RGBA')
            if img_old.size != img_new.size:
                img_old = img_old.resize(img_new.size, Image.Resampling.LANCZOS)

            old_scaled = img_old.resize(
                (img_old.width * scale, img_old.height * scale),
                Image.Resampling.NEAREST
            )
            new_scaled = img_new.resize(
                (img_new.width * scale, img_new.height * scale),
                Image.Resampling.NEAREST
            )

            diff = ImageChops.difference(old_scaled, new_scaled)
            new_highlighted = new_scaled.copy()
            new_pixels = new_highlighted.load()
            diff_pixels = diff.load()
            for x in range(diff.width):
                for y in range(diff.height):
                    r, g, b, a = diff_pixels[x, y]
                    if r > threshold or g > threshold or b > threshold:
                        orig_r, orig_g, orig_b, orig_a = new_pixels[x, y]
                        new_pixels[x, y] = (
                            int(orig_r * 0.3 + 255 * 0.7),
                            int(orig_g * 0.3),
                            int(orig_b * 0.3),
                            orig_a
                        )

            total_width = old_scaled.width + gap + new_highlighted.width
            total_height = max(old_scaled.height, new_highlighted.height)
            combined = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))
            combined.paste(old_scaled, (0, 0))
            combined.paste(new_highlighted, (old_scaled.width + gap, 0))
            combined.save(final_path, 'PNG')
        else:
            new_scaled = img_new.resize(
                (img_new.width * scale, img_new.height * scale),
                Image.Resampling.NEAREST
            )
            new_scaled.save(final_path, 'PNG')

        diff_images.append({
            'path': final_path,
            'filename': output_filename,
            'file_path': file_path
        })

    except Exception as e:
        print(f"Failed to process diff for {file_path}: {e}")

if not diff_images:
    sys.exit(0)

os.makedirs('diff-images', exist_ok=True)
for img in diff_images:
    os.rename(img['path'], f'diff-images/{img["filename"]}')

comment_body = "### Skin Visual Diff\n\n> Left: old version, Right: new version with red highlights for changed pixels.\n\n"
for img in diff_images:
    image_url = f"https://raw.githubusercontent.com/{os.environ.get('GITHUB_REPOSITORY')}/pr-artifacts/pr-{os.environ.get('PR_NUMBER')}/{img['filename']}"
    comment_body += f"**{img['file_path']}**\n"
    comment_body += f"![{img['filename']}]({image_url})\n\n"

with open('pr_comment.md', 'w') as f:
    f.write(comment_body)

with open('artifact-files.txt', 'w') as f:
    for img in diff_images:
        f.write(f"diff-images/{img['filename']}\n")

print('Comment body and artifact file list written')