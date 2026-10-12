// Finds a Chrome/Chromium for the tests. Order: CHROME_PATH env var, the browser that `npm install` (puppeteer) downloaded, common install locations.
const fs=require('fs');
function find(){
  if(process.env.CHROME_PATH)return process.env.CHROME_PATH;
  try{const p=require('puppeteer').executablePath();if(p&&fs.existsSync(p))return p}catch(e){}
  const c=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'];
  const hit=c.find(p=>fs.existsSync(p));if(!hit)throw new Error('No Chrome found: run "npm install" in tools/tests or set CHROME_PATH');return hit}
module.exports={args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'],executablePath:async()=>find()};
