import { resolve } from 'node:path';

// src/ in development and tests, dist/ after build: the project root is one level up in both cases.
export const ROOT_DIR = resolve(import.meta.dirname, '..');
