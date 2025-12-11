const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  try {
    const resumeHtml = path.resolve(__dirname, '..', 'assets', 'docs', 'resume.html');
    const outPdf = path.resolve(__dirname, '..', 'assets', 'docs', 'resume.pdf');

    if (!fs.existsSync(resumeHtml)) {
      console.error('resume.html not found at', resumeHtml);
      process.exit(1);
    }

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('file://' + resumeHtml, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outPdf, format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
    await browser.close();
    console.log('PDF generated at', outPdf);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
