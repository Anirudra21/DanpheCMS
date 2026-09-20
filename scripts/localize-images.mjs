import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const IMAGE_URL_REGEX = /https?:\/\/[^"'\s\)]+\.(?:png|jpg|jpeg|gif|svg|webp)/g;

let downloadedImages = 0;
let replacedUrls = 0;
let foldersCreated = new Set();

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      resolve(); // Already downloaded
      return;
    }

    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      foldersCreated.add(dir);
    }

    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          downloadedImages++;
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

const getCategoryAndFilename = (url) => {
  const parsedUrl = new URL(url);
  let filename = path.basename(parsedUrl.pathname);
  
  // Categorization logic
  let category = 'content';
  if (url.toLowerCase().includes('logo')) {
    category = 'logo';
  } else if (filename.endsWith('.svg')) {
    category = 'icons';
  } else if (url.includes('frontend/img/banner') || url.includes('banner')) {
    category = 'banners';
  }
  
  // To avoid naming collisions if different images have same filename
  // For unpkg and external random ones, maybe prefix domain? 
  // For now just use filename, it should be unique enough in DanpheCMS storage
  return { category, filename };
};

const processFile = async (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let hasChanges = false;
  const urls = content.match(IMAGE_URL_REGEX);

  if (urls) {
    for (const url of [...new Set(urls)]) {
      const { category, filename } = getCategoryAndFilename(url);
      const localRelPath = `/images/${category}/${filename}`;
      const localAbsPath = path.join(PUBLIC_DIR, 'images', category, filename);

      try {
        await downloadImage(url, localAbsPath);
        const urlRegex = new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(urlRegex);
        if (matches) {
           replacedUrls += matches.length;
           content = content.replace(urlRegex, localRelPath);
           hasChanges = true;
        }
      } catch (err) {
        console.error(`Error processing URL ${url} in file ${filePath}:`, err.message);
      }
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${path.relative(ROOT_DIR, filePath)}`);
  }
};

const walkSync = (dir, callback) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkSync(filePath, callback);
    } else {
      // Only process likely source files
      if (/\.(ts|tsx|js|jsx|json|css|scss|md)$/.test(filePath)) {
        callback(filePath);
      }
    }
  }
};

const main = async () => {
  console.log('Starting image localization...');
  const filesToProcess = [];
  walkSync(SRC_DIR, (filePath) => filesToProcess.push(filePath));

  for (const file of filesToProcess) {
    await processFile(file);
  }

  console.log('\n--- Summary ---');
  console.log(`Images downloaded: ${downloadedImages}`);
  console.log(`URL references replaced: ${replacedUrls}`);
  console.log(`Folders created: ${foldersCreated.size}`);
};

main().catch(console.error);
