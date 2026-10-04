import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module.js';
import { PagesController } from './pages.controller.js';

@Module({
  imports: [ContentModule],
  controllers: [PagesController],
})
export class PagesModule {}
