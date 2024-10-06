import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
export declare class AppController {
    private readonly appService;
    private readonly prisma;
    constructor(appService: AppService, prisma: PrismaService);
    getHello(): string;
    getCrawl(): Promise<string>;
    getCrawl2(): Promise<string>;
    login(): Promise<{
        name: string;
        code: string;
        id: number;
    }>;
    cert(): Promise<{
        name: string;
        code: string;
        id: number;
    }[]>;
    readAudio(): Promise<string>;
}
