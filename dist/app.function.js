"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawl = crawl;
const puppeteer_1 = require("puppeteer");
const i_name = '최원진';
const i_birth = '19940805';
const i_phone = '27721491';
const i_auth_target = "카카오톡";
const headless = false;
async function crawl() {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';
    const browser = await puppeteer_1.default.launch({ headless });
    const page = await browser.newPage();
    page.setUserAgent(userAgent);
    if (!headless) {
        await page.setViewport({
            width: 1366,
            height: 768
        });
    }
    await page.goto('https://www.nhis.or.kr/nhis/etc/personalLoginPage.do');
    await page.click('xpath=//*[@id="pc_view"]/div[2]/div[1]/button');
    await page.waitForSelector('xpath=//input[@data-id="oacx_name"]');
    await page.evaluate((auth_target) => {
        const clickEvent = new Event('click');
        const target = Array.from(document.querySelectorAll('label .label-nm p')).find(el => el.textContent === auth_target);
        if (target) {
            target.click();
            target.dispatchEvent(clickEvent);
        }
    }, i_auth_target);
    await page.focus('xpath=//input[@data-id="oacx_name"]');
    await page.keyboard.type(i_name);
    await page.focus('xpath=//input[@data-id="oacx_birth"]');
    await page.keyboard.type(i_birth);
    await page.focus('xpath=//input[@data-id="oacx_phone2"]');
    await page.keyboard.type(i_phone);
    await page.evaluate(() => {
        const clickEvent = new Event('click');
        document.querySelector('#totalAgree').click();
        document.querySelector('#totalAgree').dispatchEvent(clickEvent);
        document.querySelector('#oacx-request-btn-pc').click();
        document.querySelector('#oacx-request-btn-pc').dispatchEvent(clickEvent);
    });
}
;
//# sourceMappingURL=app.function.js.map