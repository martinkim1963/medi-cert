import { Page } from 'puppeteer';
export declare class AppService {
    session: Page;
    getHello(): string;
    crawl(): Promise<void>;
    crawl2(): Promise<string>;
}
