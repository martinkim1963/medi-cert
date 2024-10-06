"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const puppeteer_1 = require("puppeteer");
const i_name = '최원진';
const i_birth = '19940805';
const i_phone = '27721491';
const i_auth_target = "카카오톡";
const headless = false;
let AppService = class AppService {
    constructor() {
        this.session = null;
    }
    getHello() {
        return 'Hello World!';
    }
    async crawl() {
        const downloadPath = path_1.default.resolve(__dirname, 'downloads');
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
        const xpath = '//*[@id="oacxEmbededContents"]/div[2]/div/div[3]/button';
        try {
            const elements = await page.$$(xpath);
            console.log({ elements });
            if (elements.length > 0) {
                console.log('요소가 존재합니다.');
            }
            else {
                console.log('요소가 존재하지 않습니다.');
            }
        }
        catch (error) {
            console.log('요소가 존재하지 않습니다.');
        }
        this.session = page;
    }
    async crawl2() {
        const page = this.session;
        if (page === null) {
            return null;
        }
        await page.click('xpath=//*[@id="oacxEmbededContents"]/div[1]/div/button[2]');
        await page.waitForNavigation();
        await page.goto('https://www.nhis.or.kr/nhis/healthin/retrieveHealthinCheckUpTargetResultPerson.do');
        const rand = await page.evaluate(() => {
            const browserWindow = window;
            return browserWindow.rand;
        });
        return rand;
        console.log({ rand });
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map