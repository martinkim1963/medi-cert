import puppeteer, { Page } from 'puppeteer'


const i_name = '최원진';
const i_birth = '19940805';
const i_phone = '27721491';
const i_auth_target = "카카오톡"
const headless = false

let session: Page = null


export async function crawl() {
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
        const clickEvent = new Event('click');
        document.querySelector<HTMLButtonElement>('#totalAgree').click()
        document.querySelector('#totalAgree').dispatchEvent(clickEvent)
        document.querySelector<HTMLButtonElement>('#oacx-request-btn-pc').click()
        document.querySelector('#oacx-request-btn-pc').dispatchEvent(clickEvent)
    });
    session = page
};




export async function crawl2() {
    const page = session
    if (page === null) {
        return null
    }

    await page.click('xpath=//*[@id="oacxEmbededContents"]/div[1]/div/button[2]')
    await page.goto('https://www.nhis.or.kr/nhis/healthin/retrieveHealthinCheckUpTargetResultPerson.do');



}