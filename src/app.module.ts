import { Module } from '@nestjs/common';
import { PagesModule } from './pages/pages.module.js';

@Module({
  imports: [PagesModule],
})
export class AppModule {}
