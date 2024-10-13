import { Page } from 'puppeteer';
export declare class AppService {
    session: Page;
    getHello(): string;
    crawl(): Promise<void>;
    crawl3(): Promise<string>;
    crawl2(): Promise<boolean>;
}
