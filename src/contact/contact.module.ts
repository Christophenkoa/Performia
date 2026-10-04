import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module.js';
import { ContactNotifier, LoggingContactNotifier } from './contact-notifier.js';
import { ContactController } from './contact.controller.js';

@Module({
  imports: [ContentModule],
  controllers: [ContactController],
  providers: [{ provide: ContactNotifier, useClass: LoggingContactNotifier }],
})
export class ContactModule {}
