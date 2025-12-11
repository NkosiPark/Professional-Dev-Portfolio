const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const dir = path.resolve(__dirname, '..', 'assets', 'images');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg') && f.startsWith('project-'));
  if (!files.length) {
    console.log('No project SVGs found');
    process.exit(0);
  }

  const browser = await puppeteer.launch({ args:['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  for (const file of files) {
    const svgPath = path.join(dir, file);
    const pngPath = path.join(dir, file.replace('.svg', '.png'));
    const svg = fs.readFileSync(svgPath, 'utf8');

    // set content and measure (use DOMContentLoaded and disable timeout to avoid external resource waits)
    await page.setContent(svg, { waitUntil: 'domcontentloaded', timeout: 0 });
    const size = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const w = svg.getAttribute('width') || svg.viewBox.baseVal.width || 800;
      const h = svg.getAttribute('height') || svg.viewBox.baseVal.height || 500;
      return { w: Math.floor(w), h: Math.floor(h) };
    });

    await page.setViewport({ width: Math.max(800, size.w), height: Math.max(500, size.h) });
    const element = await page.$('svg');
    const clip = await element.boundingBox();
    await page.screenshot({ path: pngPath, clip, omitBackground: false });
    console.log('Rendered', pngPath);
  }

  await browser.close();
})();
