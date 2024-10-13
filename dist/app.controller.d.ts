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
        code: string;
        name: string;
        id: number;
    }>;
    cert(): Promise<{
        code: string;
        name: string;
        id: number;
    }[]>;
    readAudio(): Promise<string>;
}
