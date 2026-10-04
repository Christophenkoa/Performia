import { Controller, Get, Query, Redirect, Render, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ContentService } from '../content/content.service.js';
import type { Lang } from '../content/content.types.js';
import { buildViewModel, parseLang } from '../content/view-model.js';

@Controller()
export class PagesController {
  constructor(private readonly content: ContentService) {}

  @Get()
  @Render('home')
  homePage(@Query('lang') lang: unknown) {
    return this.home(parseLang(lang));
  }

  @Get('contact')
  @Render('contact')
  contactPage(@Req() req: Request, @Query('lang') lang: unknown, @Query('sent') sent?: string) {
    return this.contact(parseLang(lang), req, sent);
  }

  // Old English URLs, kept working for links shared before the switch to ?lang=en.
  @Get('en')
  @Redirect('/?lang=en', 301)
  legacyEnglishHome() {}

  @Get('en/contact')
  @Redirect('/contact?lang=en', 301)
  legacyEnglishContact() {}

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
