const fs = require('fs');
const path = require('path');
const https = require('https');

const publicDir = path.join(__dirname, '..', 'public');

const downloads = [
  { url: 'https://danphehealth.com/admin/assets/media/logos/favicon.ico', dest: 'favicon.ico' },
  { url: 'https://danphehealth.com/downloads/danphe-hmis-brochure.pdf', dest: 'downloads/danphe-hmis-brochure.pdf' },
  { url: 'https://danphehealth.com/downloads/danphe-presentation.pdf', dest: 'downloads/danphe-presentation.pdf' }
];

const downloadFile = (url, destRelative) => {
  return new Promise((resolve, reject) => {
    const dest = path.join(publicDir, destRelative);
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
          console.log(`Downloaded: ${url} -> ${destRelative}`);
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
  const promises = downloads.map(d => downloadFile(d.url, d.dest));
  await Promise.all(promises);
  console.log('All downloads completed.');
}

run().catch(console.error);
