const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const scratchDir = '/root/scratch';
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: 'shell',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--allow-file-access-from-files'
    ]
  });

  const page = await browser.newPage();
  const filePath = 'file:///root/neovrit_download/index.html';

  // Desktop viewport 1440x900
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  // Scroll to team section
  await page.evaluate(() => {
    const el = document.querySelector('.team-container') || document.body;
    el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Desktop screenshot
  const desktopScreenshot = path.join(scratchDir, 'agent_team_desktop.png');
  await page.screenshot({ path: desktopScreenshot, fullPage: false });

  // Desktop Card Analysis
  const desktopCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.team-container .tm-clean-card'));
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      const nameEl = c.querySelector('.tm-clean-name');
      return {
        index: i + 1,
        name: nameEl ? nameEl.innerText.trim() : `Member ${i+1}`,
        offsetTop: c.offsetTop,
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });
  });

  // Mobile viewport 375x812
  await page.setViewport({ width: 375, height: 812 });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const el = document.querySelector('.team-container') || document.body;
    el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 500));

  const mobileScreenshot = path.join(scratchDir, 'agent_team_mobile.png');
  await page.screenshot({ path: mobileScreenshot, fullPage: false });

  const mobileCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.team-container .tm-clean-card'));
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      const nameEl = c.querySelector('.tm-clean-name');
      return {
        index: i + 1,
        name: nameEl ? nameEl.innerText.trim() : `Member ${i+1}`,
        offsetTop: c.offsetTop,
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });
  });

  // Group desktop cards by offsetTop / row
  const desktopRows = {};
  desktopCards.forEach(c => {
    if (!desktopRows[c.offsetTop]) {
      desktopRows[c.offsetTop] = [];
    }
    desktopRows[c.offsetTop].push(c);
  });

  console.log(JSON.stringify({
    desktop: {
      totalCards: desktopCards.length,
      rowCount: Object.keys(desktopRows).length,
      rows: Object.entries(desktopRows).map(([offsetTop, cards]) => ({
        offsetTop: Number(offsetTop),
        cardCount: cards.length,
        members: cards.map(c => c.name)
      })),
      cards: desktopCards
    },
    mobile: {
      totalCards: mobileCards.length,
      cards: mobileCards
    },
    desktopScreenshot,
    mobileScreenshot
  }, null, 2));

  await browser.close();
})();
