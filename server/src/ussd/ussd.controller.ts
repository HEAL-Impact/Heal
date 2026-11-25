import { Controller, Post, HttpCode, Req, Res } from '@nestjs/common';
import { UssdService } from './ussd.service';
import { Request, Response } from 'express';

@Controller('ussd')
export class UssdController {
  constructor(private readonly ussdService: UssdService) {}

  @Post()
  @HttpCode(200)
  async handleUssd(@Req() req: Request, @Res() res: Response) {
    const { sessionId, phoneNumber, text } = req.body;

    const output = await this.ussdService.handleSession(sessionId, phoneNumber, text);

    // Africa's Talking expects plain text (not JSON)
    res.type('text/plain');
    return res.send(output);
  }
}
