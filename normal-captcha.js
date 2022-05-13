const needle = require('needle')
const cheerio = require('cheerio')
const https = require('node:https'); // or 'https' for https:// URLs
const fs = require("fs");
const tesseract = require("node-tesseract-ocr")

async function getUrlCaptcha() {
  const result = await needle("get", "https://2captcha.com/demo/normal");
  const html = result.body;
  const $ = cheerio.load(html);
  const imageAttr = $('.Fy-pBtSfc-ohWKkLxXbEn img').attr();
  const imageUrl = (imageAttr === undefined) ? null : imageAttr.src;
  return `https://2captcha.com${imageUrl}`
}

async function downloadCaptchaImg(url) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(`${__dirname}/captcha/captcha.jpg`);
    https.get(url, function(response) {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
          file.close();
          console.log("Download Completed");
          resolve(true);
      });
    });
  })
}

async function main() {
  const url = await getUrlCaptcha();
  await downloadCaptchaImg(url);
  const img = fs.readFileSync(`${__dirname}/captcha/captcha.jpg`)
  const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
  }

  tesseract
    .recognize(img, config)
    .then((text) => {
      console.log("Result:", text)
    })
    .catch((error) => {
      console.log(error.message)
    })
}  
main();