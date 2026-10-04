import { Injectable } from '@nestjs/common';
import type { Lang, SiteContent } from './content.types.js';
import { en } from './en.js';
import { fr } from './fr.js';

const CONTENT: Record<Lang, SiteContent> = { fr, en };

export function getContent(lang: Lang): SiteContent {
  return CONTENT[lang];
}

@Injectable()
export class ContentService {
  get(lang: Lang): SiteContent {
    return getContent(lang);
  }
}
