import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { crawl, crawl2 } from './app.function';
import { PrismaService } from './prisma.service';
import { MedicalJson } from './data';
// import whisper from 'whisper-node';
// import { resolve } from 'path';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('crawl')
  async getCrawl() {
    await this.appService.crawl();
    return this.appService.getHello();
  }

  @Get('crawl2')
  async getCrawl2() {
    const data: MedicalJson = await this.appService.crawl3();
    const results =
      data['ccr:ContinuityOfCareRecord']['ccr:Body']['ccr:Results'][
        'ccr:Result'
      ];

    const vitalSigns =
      data['ccr:ContinuityOfCareRecord']['ccr:Body']['ccr:VitalSigns'][
        'ccr:Result'
      ];

    const dataList = [...results, ...vitalSigns];

    return dataList.map((r) => {
      return {
        type: r['ccr:Type']['ccr:Text'],
        desc: r['ccr:Description']['ccr:Text'],
        createdAt: r['ccr:DateTime']['ccr:ExactDateTime'],
        unit: r['ccr:Test']['ccr:TestResult']['ccr:Units']['ccr:Unit'],
        value: r['ccr:Test']['ccr:TestResult']['ccr:Value'],
      };
    });
  }

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  // @Get('login')
  // async login() {
  //   const result = await this.prisma.user.create({
  //     data: {
  //       name: 'test user',
  //       code: 'test code',
  //     },
  //   });
  //   return result;
  // }

  // @Get('cert')
  // async cert() {
  //   const result = await this.prisma.user.findMany();
  //   return result;
  // }

  // @Get('audio')
  // async readAudio() {
  //   const audioPath = resolve(__dirname, '../audio');
  //   console.log({ audioPath });

  //   const options = {
  //     withCuda: false,
  //     modelName: 'medium', // default
  //     // modelPath: "/custom/path/to/model.bin", // use model in a custom directory (cannot use along with 'modelName')
  //     whisperOptions: {
  //       language: 'ko', // default (use 'auto' for auto detect
  //       gen_file_txt: false, // outputs .txt file
  //       gen_file_subtitle: false, // outputs .srt file
  //       gen_file_vtt: false, // outputs .vtt file
  //       word_timestamps: true, // timestamp for every word
  //     },
  //   };

  //   const transcript = (await whisper(`${audioPath}/korean2.wav --no-gpu`, {
  //     ...options,
  //   })) as { start: string; end: string; speech: string }[];
  //   console.log({ transcript });
  //   const code = transcript
  //     .filter((t) => t.speech !== '-')
  //     .map((c) => c.speech)
  //     .join('');
  //   console.log({ code });
  //   return code;
  // }
}
