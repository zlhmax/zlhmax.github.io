const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const DST = path.join(__dirname, '..', 'src', 'assets', 'portfolio', 'takeoff-air-landing');
const SRC = 'D:/Myblog/takeoff-air-landing_原始照片_20260923/';
const jobs = [
  ['IMG_20221114_161454_476a86.jpg', 'takeoff-air-landing-01.jpg'],
  ['IMG_20221114_163158_5d7b75.jpg', 'takeoff-air-landing-02.jpg'],
  ['IMG_20181008_095538_a61047.jpg', 'takeoff-air-landing-03.jpg'],
  ['IMG_20190527_094532_b19900.jpg', 'takeoff-air-landing-04.jpg'],
  ['IMG_20220701_181010_f7f5ac.jpg', 'takeoff-air-landing-05.jpg'],
  ['IMG_20221114_172322_ab1194.jpg', 'takeoff-air-landing-06.jpg'],
];
(async () => {
  fs.mkdirSync(DST, { recursive: true });
  let tot = 0;
  for (const [s, d] of jobs) {
    await sharp(SRC + s).rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(DST, d));
    const st = fs.statSync(path.join(DST, d)); tot += st.size;
    console.log('  ' + d + '  ' + (st.size / 1024).toFixed(0) + ' KB');
  }
  console.log('  合计 ' + (tot / 1048576).toFixed(2) + ' MB');
})();
