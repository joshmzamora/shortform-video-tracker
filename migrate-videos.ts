
import fs from 'fs-extra';
import path from 'path';

const sourceRoot = path.join(process.cwd(), 'public', 'videos', 'Educational');
const targetRoot = path.join(process.cwd(), 'public', 'videos', 'education');

async function migrate() {
    console.log('Starting migration...');

    if (!await fs.pathExists(sourceRoot)) {
        console.error('Source directory does not exist:', sourceRoot);
        return;
    }

    await fs.ensureDir(targetRoot);

    // Helper to find video folders recursively
    async function findVideoFolders(dir: string): Promise<string[]> {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        let folders: string[] = [];

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const fullPath = path.join(dir, entry.name);
                // Check if this folder contains an .info.json file
                const files = await fs.readdir(fullPath);
                const hasInfoJson = files.some(f => f.endsWith('.info.json'));

                if (hasInfoJson) {
                    folders.push(fullPath);
                } else {
                    // Recurse
                    folders = folders.concat(await findVideoFolders(fullPath));
                }
            }
        }
        return folders;
    }

    const videoFolders = await findVideoFolders(sourceRoot);
    console.log(`Found ${videoFolders.length} video folders.`);

    for (const folder of videoFolders) {
        console.log(`Processing: ${folder}`);

        const files = await fs.readdir(folder);
        const infoFile = files.find(f => f.endsWith('.info.json'));

        if (!infoFile) {
            console.warn(`No .info.json found in ${folder}, skipping.`);
            continue;
        }

        const infoPath = path.join(folder, infoFile);
        const infoData = await fs.readJson(infoPath);
        const videoId = infoData.id;

        if (!videoId) {
            console.warn(`No ID found in ${infoFile}, skipping.`);
            continue;
        }

        const targetDir = path.join(targetRoot, videoId);
        await fs.ensureDir(targetDir);

        // 1. Move/Copy Video File
        const videoFile = files.find(f => f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mkv'));
        if (videoFile) {
            await fs.copy(path.join(folder, videoFile), path.join(targetDir, 'video.mp4'));
            console.log(`  Copied video to ${path.join(targetDir, 'video.mp4')}`);
        } else {
            console.warn(`  No video file found in ${folder}`);
        }

        // 2. Handle Description
        const descFile = files.find(f => f.endsWith('.description'));
        let description = infoData.description || '';
        if (descFile) {
            description = await fs.readFile(path.join(folder, descFile), 'utf-8');
        }
        await fs.writeFile(path.join(targetDir, 'description.txt'), description);
        console.log(`  Saved description.txt`);

        // 3. Handle Metadata
        const metadata = {
            id: videoId,
            title: infoData.title,
            channel: infoData.uploader || infoData.channel || 'Unknown',
            uploadDate: infoData.upload_date,
            duration: infoData.duration,
            viewCount: infoData.view_count,
            likeCount: infoData.like_count,
            originalUrl: infoData.webpage_url,
            tags: infoData.tags || [],
            categories: infoData.categories || []
        };
        await fs.writeJson(path.join(targetDir, 'metadata.json'), metadata, { spaces: 2 });
        console.log(`  Saved metadata.json`);

        // 4. Handle Comments
        // Check if comments are in infoData (yt-dlp sometimes puts them there)
        let comments = [];
        if (infoData.comments) {
            comments = infoData.comments;
        }
        // Also look for separate comments file if it exists (not seen in LS but possible)
        // For now, save what we have
        await fs.writeJson(path.join(targetDir, 'comments.json'), comments, { spaces: 2 });
        console.log(`  Saved comments.json (${comments.length} comments)`);

        // 5. Copy Thumbnail if exists
        const thumbFile = files.find(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));
        if (thumbFile) {
            const ext = path.extname(thumbFile);
            await fs.copy(path.join(folder, thumbFile), path.join(targetDir, `thumbnail${ext}`));
            console.log(`  Copied thumbnail`);
        }

    }

    console.log('Migration complete.');
}

migrate().catch(console.error);
