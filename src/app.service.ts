import { Injectable } from '@nestjs/common';
import puppeteer, { Page } from 'puppeteer'
import whisper from 'whisper-node';
import { mkdirSync, writeFileSync, existsSync, statSync } from 'fs'
import { resolve, basename } from 'path'
import { parse } from 'url'


const i_name = '최원진';
const i_birth = '19940805';
const i_phone = '27721491';
const i_auth_target = "카카오톡"
const headless = false


function xmlToJson(xml: any) {
  // Create the return object
  var obj = {};

  if (xml.nodeType == 1) {
    // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) {
    // text
    obj = xml.nodeValue;
  }

  // do children
  // If all text nodes inside, get concatenated text from them.
  var textNodes = [].slice.call(xml.childNodes).filter(function (node) {
    return node.nodeType === 3;
  });
  if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
    obj = [].slice.call(xml.childNodes).reduce(function (text, node) {
      return text + node.nodeValue;
    }, "");
  } else if (xml.hasChildNodes()) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof obj[nodeName] == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
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

@Injectable()
export class AppService {
  session: Page = null
  getHello(): string {
    return 'Hello World!';
  }

  async crawl() {

    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';
    const browser = await puppeteer.launch({ headless });
    const page = await browser.newPage();

    page.setUserAgent(userAgent);
    if (!headless) {
      await page.setViewport({
        width: 1366,
        height: 768
      });
    }
    // 국민건강보험 로그인 페이지로 이동
    await page.goto('https://www.nhis.or.kr/nhis/etc/personalLoginPage.do');

    // 간편 인증 로그인 버튼 클릭
    await page.click('xpath=//*[@id="pc_view"]/div[2]/div[1]/button')

    // 클릭 후, UI 변경되어 xpath의 요소 접근 가능해질때까지 대기
    await page.waitForSelector('xpath=//input[@data-id="oacx_name"]')

    // 클라인트단에서 실해(why? 인증 수단 선택요소가 클릭불가능한 비표준 요소라, 브라우저단에서 document모델로 직접 click 이벤트 조작
    await page.evaluate((auth_target) => {
      const clickEvent = new Event('click');
      // 인증수단 icon 찾기
      const target = Array.from(document.querySelectorAll<HTMLButtonElement>('label .label-nm p')).find(el => el.textContent === auth_target);
      if (target) {
        target.click()
        target.dispatchEvent(clickEvent)
      }
    }, i_auth_target);

    // key 이벤트 안태우고 직접 value='데이터' 로 셋팅하니 정상동작하지 않아, puppeteer에서 재공하는 key이벤트 태워서 입력처리
    await page.focus('xpath=//input[@data-id="oacx_name"]')
    await page.keyboard.type(i_name)
    await page.focus('xpath=//input[@data-id="oacx_birth"]')
    await page.keyboard.type(i_birth)
    await page.focus('xpath=//input[@data-id="oacx_phone2"]')
    await page.keyboard.type(i_phone)
    // 동의하기 버튼 및 인증요청 버튼 클릭
    await page.evaluate(() => {
      // const clickEvent = new Event('click');
      document.querySelector<HTMLButtonElement>('#totalAgree').click()
      // document.querySelector('#totalAgree').dispatchEvent(clickEvent)
      document.querySelector<HTMLButtonElement>('#oacx-request-btn-pc').click()
      // document.querySelector('#oacx-request-btn-pc').dispatchEvent(clickEvent)
    });
    const xpath = '//*[@id="oacxEmbededContents"]/div[2]/div/div[3]/button';
    try {
      const elements = await page.$$(xpath);
      console.log({ elements })
      if (elements.length > 0) {
        console.log('요소가 존재합니다.');
      } else {
        console.log('요소가 존재하지 않습니다.');
      }
    } catch (error) {
      console.log('요소가 존재하지 않습니다.');
    }

    this.session = page
  }


  async crawl3() {
    const page = this.session
    if (page === null) {
      return null
    }
    await page.click('xpath=//*[@id="oacxEmbededContents"]/div[1]/div/button[2]')
    await page.waitForNavigation()
    
    const XmlString = await page.evaluate(async () => {
      const response = await fetch('https://www.nhis.or.kr/nhis/healthin/retrieveCrryy10Dnlod.do', {
        method: 'GET',
        // 필요한 경우 헤더 추가
      });
      return await response.text();
    });

    return XmlString
  }


  async crawl2() {
    const page = this.session
    if (page === null) {
      return null
    }
    await page.click('xpath=//*[@id="oacxEmbededContents"]/div[1]/div/button[2]')
    await page.waitForNavigation()
    await page.goto('https://www.nhis.or.kr/nhis/healthin/retrieveHealthinCheckUpTargetResultPerson.do');


    const downloadPath = resolve(__dirname, '../downloads');
    mkdirSync(downloadPath, { recursive: true });
    await page.setRequestInterception(true);

    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadPath,
    })
    page.on('request', request => {
      if (request.method() === 'OPTIONS') {
        request.abort(); // 사전 비행 요청을 abort
      } else {
        request.continue();
      }
    });
    page.on('response', async response => {
      const requestUrl = response.url();
      console.log(`Response: ${response.url()} Status: ${response.status()} Type: ${response.request().resourceType()}`);
      if (response.request().resourceType() === 'media') {
        const fileName = basename(parse(requestUrl).pathname) + '.wav';
        const filePath = resolve(downloadPath, fileName);
        const buffer = await response.buffer();
        writeFileSync(filePath, buffer);

        const options = {
          withCuda: false,
          modelName: 'medium',       // default
          // modelPath: "/custom/path/to/model.bin", // use model in a custom directory (cannot use along with 'modelName')
          whisperOptions: {
            language: 'ko',         // default (use 'auto' for auto detect
            gen_file_txt: false,      // outputs .txt file
            gen_file_subtitle: false, // outputs .srt file
            gen_file_vtt: false,      // outputs .vtt file
            word_timestamps: true     // timestamp for every word

          }
        }
        const transcript = await whisper(`${filePath} --no-gpu`, { ...options }) as { start: string, end: string, speech: string }[]
        console.log({ transcript })
        const code = transcript.filter(t => t.speech !== ']' && t.speech !== '[' && t.speech !== '-' && t.speech !== '.' && t.speech !== ',').map(c => c.speech).join('')
        console.log({ code })
        await page.focus('xpath=//*[@id="captcha"]')
        await page.keyboard.type(code)
        await page.click('xpath=//*[@id="frm_captcha_auth"]/div[2]/div[2]/a[1]')
        await page.waitForNavigation()
        await page.goto('https://www.nhis.or.kr/nhis/healthin/retrieveHealthinCheckUpTargetResultAllPerson.do');
        await page.waitForSelector('xpath=//*[@id="cms-content"]/div[3]/div[1]/a[3]',)
        await page.click('xpath=//*[@id="cms-content"]/div[3]/div[1]/a[3]')

        const XmlNode = await page.evaluate(async () => {
          const response = await fetch('https://www.nhis.or.kr/nhis/healthin/retrieveCrryy10Dnlod.do', {
            method: 'GET',
            // 필요한 경우 헤더 추가
          });
          const xmlString = await response.text();
          console.log({ xmlString })
          return new DOMParser().parseFromString(xmlString, 'text/xml');
        });
        console.log(XmlNode);
        // await page.waitForSelector('xpath=//*[@id="layer_ccr"]/div/div[3]/a[1]',)
        // await page.click('xpath=//*[@id="layer_ccr"]/div/div[3]/a[1]',)

        // await page.waitForSelector('xpath=//*[@id="layer_ccr"]/div/div[3]/a[2]',)
        // await page.click('xpath=//*[@id="layer_ccr"]/div/div[3]/a[2]',{delay:2000})
      }
    });
    await page.waitForSelector('xpath=//*[@id="captcha_soundOnKor"]',)
    await page.click('xpath=//*[@id="captcha_soundOnKor"]', { delay: 2000 })


    // await page.goto(`https://www.nhis.or.kr/cms/captcha/audio.do?lan=kor&rand=${rand}`)

    // await page.close()
    return true
  }
}
