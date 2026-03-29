import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'README.md');
const targetPath = path.join(rootDir, 'dist', 'ngx-core', 'README.md');

if (!existsSync(sourcePath)) {
	console.error(`Missing source README: ${sourcePath}`);
	process.exit(1);
}

copyFileSync(sourcePath, targetPath);
