// 把作品集源图压到网页合理尺寸（原片已备份到 D:/Myblog/angkor-wat_原始照片_20260922）
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const dir = "D:/Myblog/ryze/src/assets/portfolio/angkor-wat";
const files = fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f));

(async () => {
  let beforeAll = 0;
  let afterAll = 0;
  for (const f of files) {
    const p = path.join(dir, f);
    const before = fs.statSync(p).size;
    const meta = await sharp(p).metadata();
    const tmp = p + ".tmp.jpg";
    await sharp(p)
      .rotate() // 按 EXIF 方向摆正
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(tmp);
    fs.renameSync(tmp, p);
    const after = fs.statSync(p).size;
    beforeAll += before;
    afterAll += after;
    console.log(
      `  ${f}  ${meta.width}x${meta.height} -> 2000px  ${(before / 1048576).toFixed(2)}MB -> ${(after / 1024).toFixed(0)}KB`
    );
  }
  console.log(
    `  ---- 合计 ${(beforeAll / 1048576).toFixed(2)}MB -> ${(afterAll / 1048576).toFixed(2)}MB (省 ${(100 - (afterAll / beforeAll) * 100).toFixed(1)}%)`
  );
})();
