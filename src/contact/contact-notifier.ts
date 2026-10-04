import { Injectable, Logger } from '@nestjs/common';
import type { Lang } from '../content/content.types.js';
import type { ContactValues } from './contact.dto.js';

export interface ContactRequest extends ContactValues {
  lang: Lang;
  receivedAt: Date;
}

// Delivery channel for contact requests. v1 logs; an email or database implementation can replace it via DI.
export abstract class ContactNotifier {
  abstract notify(request: ContactRequest): Promise<void>;
}

@Injectable()
export class LoggingContactNotifier extends ContactNotifier {
  private readonly logger = new Logger('ContactRequest');

  notify(request: ContactRequest): Promise<void> {
    // Phone, subject and message are deliberately not logged (GDPR data minimisation).
    this.logger.log(
      `New contact request from ${request.name} <${request.email}> lang=${request.lang} at=${request.receivedAt.toISOString()}`,
    );
    return Promise.resolve();
  }
}
