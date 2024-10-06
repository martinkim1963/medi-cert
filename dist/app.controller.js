"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("./prisma.service");
const whisper_node_1 = require("whisper-node");
let AppController = class AppController {
    constructor(appService, prisma) {
        this.appService = appService;
        this.prisma = prisma;
    }
    getHello() {
        return this.appService.getHello();
    }
    async getCrawl() {
        await this.appService.crawl();
        return this.appService.getHello();
    }
    async getCrawl2() {
        const rand = await this.appService.crawl2();
        const options = {
            modelName: "small",
            whisperOptions: {
                language: 'ko',
                gen_file_txt: false,
                gen_file_subtitle: false,
                gen_file_vtt: false,
                word_timestamps: true
            }
        };
        const transcript = await (0, whisper_node_1.default)(`https://www.nhis.or.kr/cms/captcha/audio.do?lan=kor&rand=${rand}`, options);
        const code = transcript.filter(t => t.speech !== '-').map(c => c.speech).join('');
        console.log({ code });
        return code;
    }
    async login() {
        const result = await this.prisma.user.create({
            data: {
                name: 'test user',
                code: 'test code'
            }
        });
        return result;
    }
    async cert() {
        const result = await this.prisma.user.findMany();
        return result;
    }
    async readAudio() {
        const options = {
            modelName: "small",
            whisperOptions: {
                language: 'ko',
                gen_file_txt: false,
                gen_file_subtitle: false,
                gen_file_vtt: false,
                word_timestamps: true
            }
        };
        const transcript = await (0, whisper_node_1.default)("/Users/choewonjin/Desktop/medi-cert/audio/korean.wav", options);
        const code = transcript.filter(t => t.speech !== '-').map(c => c.speech).join('');
        console.log({ code });
        return code;
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)("crawl"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getCrawl", null);
__decorate([
    (0, common_1.Get)("crawl2"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getCrawl2", null);
__decorate([
    (0, common_1.Get)("login"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
__decorate([
    (0, common_1.Get)("cert"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "cert", null);
__decorate([
    (0, common_1.Get)("audio"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "readAudio", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService, prisma_service_1.PrismaService])
], AppController);
//# sourceMappingURL=app.controller.js.map