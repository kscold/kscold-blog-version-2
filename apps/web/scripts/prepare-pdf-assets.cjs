const fs = require('node:fs');
const path = require('node:path');

module.exports = function preparePdfAssets() {
  // 워커·한글 CMap·폰트는 설치한 PDF.js와 같은 버전으로 자체 호스팅한다.
  const packagePath = require.resolve('pdfjs-dist/package.json');
  const source = path.dirname(packagePath);
  const { version } = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const destination = path.join(__dirname, '../public/pdfjs', version);
  const marker = path.join(destination, '.ready');
  if (fs.existsSync(marker) && fs.existsSync(path.join(destination, 'LICENSE'))) return;
  fs.mkdirSync(destination, { recursive: true });
  for (const directory of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
    const assets = path.join(source, directory);
    if (fs.existsSync(assets))
      fs.cpSync(assets, path.join(destination, directory), { recursive: true });
  }
  fs.copyFileSync(
    path.join(source, 'build/pdf.worker.min.mjs'),
    path.join(destination, 'pdf.worker.min.mjs')
  );
  fs.copyFileSync(path.join(source, 'LICENSE'), path.join(destination, 'LICENSE'));
  fs.writeFileSync(marker, version);
};
