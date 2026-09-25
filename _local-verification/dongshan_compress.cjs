const sharp = require('sharp');
const path = require('path');
const DST = path.join(__dirname, '..', 'src', 'assets', 'portfolio', 'dongshan-island');
const jobs = [
  ['IMG_20220619_080051_c81666.jpg', 'dongshan-island-01.jpg'],
  ['IMG_20220619_075025_eab529.jpg', 'dongshan-island-02.jpg'],
];
const SRC = 'D:/Myblog/dongshan_原始照片_20260923/';
(async () => {
  const fs = require('fs');
  fs.mkdirSync(DST, { recursive: true });
  for (const [s, d] of jobs) {
    await sharp(SRC + s).rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(DST, d));
    const st = fs.statSync(path.join(DST, d));
    console.log('  ' + d + '  ' + (st.size / 1024).toFixed(0) + ' KB');
  }
})();
