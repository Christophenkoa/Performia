import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { AppModule } from './app.module.js';
import { loadConfig } from './config.js';

if (existsSync('.env')) process.loadEnvFile('.env');
const config = loadConfig();

const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
await app.listen(config.port);
