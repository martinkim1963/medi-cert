import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { crawl, crawl2 } from './app.function';
import { PrismaService } from './prisma.service';
import whisper from 'whisper-node';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly prisma: PrismaService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("crawl")
  async getCrawl() {
    await this.appService.crawl()
    return this.appService.getHello();
  }

  @Get("crawl2")
  async getCrawl2() {
    const rand = await this.appService.crawl2()
    const options = {
      modelName: "small",       // default
      // modelPath: "/custom/path/to/model.bin", // use model in a custom directory (cannot use along with 'modelName')
      whisperOptions: {
        language: 'ko',         // default (use 'auto' for auto detect
        gen_file_txt: false,      // outputs .txt file
        gen_file_subtitle: false, // outputs .srt file
        gen_file_vtt: false,      // outputs .vtt file
        word_timestamps: true     // timestamp for every word
      }
    }

    const transcript = await whisper(`https://www.nhis.or.kr/cms/captcha/audio.do?lan=kor&rand=${rand}`, options) as { start: string, end: string, speech: string }[]
    const code = transcript.filter(t => t.speech !== '-').map(c => c.speech).join('')
    console.log({ code })
    return code
  }


  @Get("login")
  async login() {
    const result = await this.prisma.user.create({
      data: {
        name: 'test user',
        code: 'test code'
      }
    })
    return result
  }

  @Get("cert")
  async cert() {
    const result = await this.prisma.user.findMany()
    return result
  }

  @Get("audio")
  async readAudio() {
    const options = {
      modelName: "small",       // default
      // modelPath: "/custom/path/to/model.bin", // use model in a custom directory (cannot use along with 'modelName')
      whisperOptions: {
        language: 'ko',         // default (use 'auto' for auto detect
        gen_file_txt: false,      // outputs .txt file
        gen_file_subtitle: false, // outputs .srt file
        gen_file_vtt: false,      // outputs .vtt file
        word_timestamps: true     // timestamp for every word
      }
    }

    const transcript = await whisper("/Users/choewonjin/Desktop/medi-cert/audio/korean.wav", options) as { start: string, end: string, speech: string }[]
    const code = transcript.filter(t => t.speech !== '-').map(c => c.speech).join('')
    console.log({ code })
    return code
  }
}
