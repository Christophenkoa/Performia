import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ContentService } from '../content/content.service.js';
import type { Lang } from '../content/content.types.js';
import { buildViewModel } from '../content/view-model.js';

@Controller()
export class PagesController {
  constructor(private readonly content: ContentService) {}

  @Get()
  @Render('home')
  homeFr() {
    return this.home('fr');
  }

  @Get('en')
  @Render('home')
  homeEn() {
    return this.home('en');
  }

  @Get('contact')
  @Render('contact')
  contactFr(@Req() req: Request, @Query('sent') sent?: string) {
    return this.contact('fr', req, sent);
  }

  @Get('en/contact')
  @Render('contact')
  contactEn(@Req() req: Request, @Query('sent') sent?: string) {
    return this.contact('en', req, sent);
  }

  private home(lang: Lang) {
    return buildViewModel(this.content.get(lang), lang, 'home');
  }

  private contact(lang: Lang, req: Request, sent?: string) {
    return buildViewModel(this.content.get(lang), lang, 'contact', {
      csrfToken: req.csrfToken?.() ?? '',
      sent: sent === '1',
      values: {},
      errors: {},
      hasErrors: false,
    });
  }
}
