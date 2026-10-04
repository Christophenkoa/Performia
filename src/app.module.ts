import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ContactModule } from './contact/contact.module.js';
import { PagesModule } from './pages/pages.module.js';

@Module({
  imports: [
    // Applied only where ThrottlerGuard is used (the contact form POST routes).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    PagesModule,
    ContactModule,
  ],
})
export class AppModule {}
