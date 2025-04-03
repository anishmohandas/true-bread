const fs = require('fs-extra');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, 'src', 'assets', 'dflip');

// Clean and create directories
fs.removeSync(targetDir);
fs.ensureDirSync(targetDir);

const directories = [
  'js/libs',
  'css',
  'images',
  'sound',
  'fonts',
  'images/pdfjs',
  'js/libs/cmaps'
];

directories.forEach(dir => {
  fs.ensureDirSync(path.join(targetDir, dir));
});

const filesToDownload = [
  // JavaScript files
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r174/three.min.js',
    fallback: 'https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.min.js',
    path: 'js/libs/three.min.js'
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js',
    fallback: 'https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.min.js',
    path: 'js/libs/pdf.min.js'
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js',
    fallback: 'https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
    path: 'js/libs/pdf.worker.min.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/gh/deepak-ghimire/dflip@1.5.7/assets/js/libs/compatibility.js',
    fallback: 'https://raw.githubusercontent.com/deepak-ghimire/dflip/1.5.7/assets/js/libs/compatibility.js',
    path: 'js/libs/compatibility.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/gh/deepak-ghimire/dflip@1.5.7/assets/js/libs/mockup.min.js',
    fallback: 'https://raw.githubusercontent.com/deepak-ghimire/dflip/1.5.7/assets/js/libs/mockup.min.js',
    path: 'js/libs/mockup.min.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/gh/deepak-ghimire/dflip@1.5.7/assets/js/dflip.min.js',
    fallback: 'https://raw.githubusercontent.com/deepak-ghimire/dflip/1.5.7/assets/js/dflip.min.js',
    path: 'js/dflip.min.js'
  },
  // CSS files
  {
    url: 'https://cdn.jsdelivr.net/gh/deepak-ghimire/dflip@1.5.7/assets/css/dflip.min.css',
    fallback: 'https://raw.githubusercontent.com/deepak-ghimire/dflip/1.5.7/assets/css/dflip.min.css',
    path: 'css/dflip.min.css'
  },
  {
    url: 'https://cdn.jsdelivr.net/gh/deepak-ghimire/dflip@1.5.7/assets/css/themify-icons.min.css',
    fallback: 'https://raw.githubusercontent.com/deepak-ghimire/dflip/1.5.7/assets/css/themify-icons.min.css',
    path: 'css/themify-icons.min.css'
  },
  // Sound files
  {
    url: 'https://cdn.jsdelivr.net/gh/deepak-ghimire/dflip@1.5.7/assets/sound/turn2.mp3',
    fallback: 'https://raw.githubusercontent.com/deepak-ghimire/dflip/1.5.7/assets/sound/turn2.mp3',
    path: 'sound/turn2.mp3'
  }
];

const downloadFile = (file) => {
  return new Promise((resolve, reject) => {
    const tryDownload = (url) => {
      const targetPath = path.join(targetDir, file.path);
      console.log(`Attempting to download from ${url} to ${targetPath}`);
      
      const request = https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          const location = new URL(response.headers.location, url).toString();
          console.log(`Following redirect for ${file.path} to ${location}`);
          
          https.get(location, (redirectedResponse) => {
            const fileStream = fs.createWriteStream(targetPath);
            redirectedResponse.pipe(fileStream);
            
            fileStream.on('finish', () => {
              fileStream.close();
              console.log(`Successfully downloaded: ${file.path}`);
              resolve();
            });
            
            fileStream.on('error', (err) => {
              console.error(`Error writing file ${file.path}:`, err);
              reject(err);
            });
          }).on('error', (err) => {
            console.error(`Error following redirect for ${file.path}:`, err);
            if (file.fallback && url !== file.fallback) {
              console.log(`Trying fallback URL for ${file.path}`);
              tryDownload(file.fallback);
            } else {
              reject(err);
            }
          });
        } else {
          if (response.statusCode !== 200) {
            console.error(`Failed to download ${file.path}: Status ${response.statusCode}`);
            if (file.fallback && url !== file.fallback) {
              console.log(`Trying fallback URL for ${file.path}`);
              tryDownload(file.fallback);
            } else {
              reject(new Error(`HTTP Status ${response.statusCode} for ${url}`));
            }
            return;
          }
          
          const fileStream = fs.createWriteStream(targetPath);
          response.pipe(fileStream);
          
          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Successfully downloaded: ${file.path}`);
            resolve();
          });
          
          fileStream.on('error', (err) => {
            console.error(`Error writing file ${file.path}:`, err);
            reject(err);
          });
        }
      });
      
      request.on('error', (err) => {
        console.error(`Error downloading ${file.path}:`, err);
        if (file.fallback && url !== file.fallback) {
          console.log(`Trying fallback URL for ${file.path}`);
          tryDownload(file.fallback);
        } else {
          reject(err);
        }
      });
      
      request.setTimeout(30000, () => {
        request.destroy();
        if (file.fallback && url !== file.fallback) {
          console.log(`Timeout - trying fallback URL for ${file.path}`);
          tryDownload(file.fallback);
        } else {
          reject(new Error(`Timeout downloading ${file.path}`));
        }
      });
    };
    
    tryDownload(file.url);
  });
};

async function downloadAllFiles() {
  let hasErrors = false;
  
  for (const file of filesToDownload) {
    try {
      await downloadFile(file);
    } catch (error) {
      hasErrors = true;
      console.error(`Failed to download ${file.path}:`, error);
    }
  }
  
  if (hasErrors) {
    throw new Error('Some files failed to download');
  }
}

// Execute the download
console.log('Starting file downloads...');
downloadAllFiles()
  .then(() => {
    console.log('All files downloaded successfully');
    // Verify files exist
    filesToDownload.forEach(file => {
      const filePath = path.join(targetDir, file.path);
      if (!fs.existsSync(filePath)) {
        console.error(`Warning: File not found after download: ${filePath}`);
      } else {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          console.error(`Warning: File is empty: ${filePath}`);
        }
      }
    });
  })
  .catch(error => {
    console.error('Error during download process:', error);
    process.exit(1);
  });




