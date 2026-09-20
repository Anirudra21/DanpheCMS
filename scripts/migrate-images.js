const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const URL_REGEX = /https:\/\/danphehealth\.com(\/[a-zA-Z0-9_\-\.\/]+?\.(?:png|jpg|jpeg|svg|webp|gif))/g;

// Files and directories to ignore
const IGNORE_DIRS = ['node_modules', '.next', '.git', 'public', 'tool-results', 'download', 'upload'];

// Collect files to scan
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        getFiles(filePath, files);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.html') || file.endsWith('.md')) {
        files.push(filePath);
      }
    }
  }
  return files;
}

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    // Check if file already exists
    if (fs.existsSync(dest)) {
      console.log(`File already exists: ${dest}`);
      resolve(true);
      return;
    }

    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${url} -> ${dest}`);
          resolve(true);
        });
      } else {
        console.error(`Failed to download ${url}: Status Code ${response.statusCode}`);
        file.close();
        fs.unlink(dest, () => {});
        resolve(false);
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${url}: ${err.message}`);
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
};

async function run() {
  const files = getFiles(rootDir);
  const downloadPromises = [];
  const urlMap = new Map();

  console.log(`Scanning ${files.length} files...`);

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let match;
    let fileModified = false;

    while ((match = URL_REGEX.exec(content)) !== null) {
      const fullUrl = match[0];
      const relativePath = match[1];
      
      const destPath = path.join(publicDir, relativePath);
      
      if (!urlMap.has(fullUrl)) {
        urlMap.set(fullUrl, destPath);
        downloadPromises.push(downloadFile(fullUrl, destPath));
      }
      
      content = content.replace(fullUrl, relativePath);
      fileModified = true;
    }

    if (fileModified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated file: ${file}`);
    }
  }

  console.log(`Found ${urlMap.size} unique URLs to download.`);
  await Promise.all(downloadPromises);
  console.log('Migration completed successfully.');
}

run().catch(console.error);
