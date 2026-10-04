import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { AppModule } from './app.module.js';
import { loadConfig } from './config.js';
import { configureApp } from './setup-app.js';

if (existsSync('.env')) process.loadEnvFile('.env');
const config = loadConfig();

// Body parsing is configured in configureApp (urlencoded only, 10 kb limit).
const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
configureApp(app, config);
await app.listen(config.port);
