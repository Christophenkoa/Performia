import { Controller, Get, Render } from '@nestjs/common';
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

  private home(lang: Lang) {
    return buildViewModel(this.content.get(lang), lang, 'home');
  }
}
