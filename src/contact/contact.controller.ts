import { Body, Controller, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ContentService } from '../content/content.service.js';
import type { Lang } from '../content/content.types.js';
import { buildViewModel, parseLang, pathFor } from '../content/view-model.js';
import { ContactNotifier } from './contact-notifier.js';
import { isHoneypotFilled, pickContactValues, validateContact } from './contact.dto.js';

@Controller()
@UseGuards(ThrottlerGuard)
export class ContactController {
  constructor(
    private readonly content: ContentService,
    private readonly notifier: ContactNotifier,
  ) {}

  @Post('contact')
  submitForm(
    @Req() req: Request,
    @Res() res: Response,
    @Query('lang') lang: unknown,
    @Body() body?: Record<string, unknown>,
  ): Promise<void> {
    return this.submit(parseLang(lang), req, res, body ?? {});
  }

  private async submit(lang: Lang, req: Request, res: Response, body: Record<string, unknown>): Promise<void> {
    const successUrl = pathFor(lang, 'contact', { sent: '1' });

    // Bots get the same answer as people, so they cannot learn that they were filtered.
    if (isHoneypotFilled(body)) {
      res.redirect(303, successUrl);
      return;
    }

    const result = await validateContact(body);
    if (!result.ok) {
      const t = this.content.get(lang);
      const errors = Object.fromEntries(result.fields.map((field) => [field, t.contact.errors[field]]));
      res.status(400).render(
        'contact',
        buildViewModel(t, lang, 'contact', {
          csrfToken: req.csrfToken?.() ?? '',
          sent: false,
          values: pickContactValues(body),
          errors,
          hasErrors: true,
        }),
      );
      return;
    }

    await this.notifier.notify({ ...result.value, lang, receivedAt: new Date() });
    res.redirect(303, successUrl);
  }
}
