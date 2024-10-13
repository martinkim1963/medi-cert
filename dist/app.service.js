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
const puppeteer_1 = require("puppeteer");
const whisper_node_1 = require("whisper-node");
const fs_1 = require("fs");
const path_1 = require("path");
const url_1 = require("url");
const i_name = '최원진';
const i_birth = '19940805';
const i_phone = '27721491';
const i_auth_target = "카카오톡";
const headless = false;
function xmlToJson(xml) {
    var obj = {};
    if (xml.nodeType == 1) {
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    }
    else if (xml.nodeType == 3) {
        obj = xml.nodeValue;
    }
    var textNodes = [].slice.call(xml.childNodes).filter(function (node) {
        return node.nodeType === 3;
    });
    if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
        obj = [].slice.call(xml.childNodes).reduce(function (text, node) {
            return text + node.nodeValue;
        }, "");
    }
    else if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof obj[nodeName] == "undefined") {
                obj[nodeName] = xmlToJson(item);
            }
            else {
                if (typeof obj[nodeName].push == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}
let AppService = class AppService {
    constructor() {
        this.session = null;
    }
    getHello() {
        return 'Hello World!';
    }
    async crawl() {
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
            document.querySelector('#totalAgree').click();
            document.querySelector('#oacx-request-btn-pc').click();
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
    async crawl3() {
        const page = this.session;
        if (page === null) {
            return null;
        }
        await page.click('xpath=//*[@id="oacxEmbededContents"]/div[1]/div/button[2]');
        await page.waitForNavigation();
        const XmlString = await page.evaluate(async () => {
            const response = await fetch('https://www.nhis.or.kr/nhis/healthin/retrieveCrryy10Dnlod.do', {
                method: 'GET',
            });
            return await response.text();
        });
        return XmlString;
    }
    async crawl2() {
        const page = this.session;
        if (page === null) {
            return null;
        }
        await page.click('xpath=//*[@id="oacxEmbededContents"]/div[1]/div/button[2]');
        await page.waitForNavigation();
        await page.goto('https://www.nhis.or.kr/nhis/healthin/retrieveHealthinCheckUpTargetResultPerson.do');
        const downloadPath = (0, path_1.resolve)(__dirname, '../downloads');
        (0, fs_1.mkdirSync)(downloadPath, { recursive: true });
        await page.setRequestInterception(true);
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadPath,
        });
        page.on('request', request => {
            if (request.method() === 'OPTIONS') {
                request.abort();
            }
            else {
                request.continue();
            }
        });
        page.on('response', async (response) => {
            const requestUrl = response.url();
            console.log(`Response: ${response.url()} Status: ${response.status()} Type: ${response.request().resourceType()}`);
            if (response.request().resourceType() === 'media') {
                const fileName = (0, path_1.basename)((0, url_1.parse)(requestUrl).pathname) + '.wav';
                const filePath = (0, path_1.resolve)(downloadPath, fileName);
                const buffer = await response.buffer();
                (0, fs_1.writeFileSync)(filePath, buffer);
                const options = {
                    withCuda: false,
                    modelName: 'medium',
                    whisperOptions: {
                        language: 'ko',
                        gen_file_txt: false,
                        gen_file_subtitle: false,
                        gen_file_vtt: false,
                        word_timestamps: true
                    }
                };
                const transcript = await (0, whisper_node_1.default)(`${filePath} --no-gpu`, { ...options });
                console.log({ transcript });
                const code = transcript.filter(t => t.speech !== ']' && t.speech !== '[' && t.speech !== '-' && t.speech !== '.' && t.speech !== ',').map(c => c.speech).join('');
                console.log({ code });
                await page.focus('xpath=//*[@id="captcha"]');
                await page.keyboard.type(code);
                await page.click('xpath=//*[@id="frm_captcha_auth"]/div[2]/div[2]/a[1]');
                await page.waitForNavigation();
                await page.goto('https://www.nhis.or.kr/nhis/healthin/retrieveHealthinCheckUpTargetResultAllPerson.do');
                await page.waitForSelector('xpath=//*[@id="cms-content"]/div[3]/div[1]/a[3]');
                await page.click('xpath=//*[@id="cms-content"]/div[3]/div[1]/a[3]');
                const XmlNode = await page.evaluate(async () => {
                    const response = await fetch('https://www.nhis.or.kr/nhis/healthin/retrieveCrryy10Dnlod.do', {
                        method: 'GET',
                    });
                    const xmlString = await response.text();
                    console.log({ xmlString });
                    return new DOMParser().parseFromString(xmlString, 'text/xml');
                });
                console.log(XmlNode);
            }
        });
        await page.waitForSelector('xpath=//*[@id="captcha_soundOnKor"]');
        await page.click('xpath=//*[@id="captcha_soundOnKor"]', { delay: 2000 });
        return true;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map