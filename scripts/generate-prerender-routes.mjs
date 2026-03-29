import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const docsPath = resolve('projects/ngx-core-app/src/app/services/service-docs.ts');
const outputPath = resolve('projects/ngx-core-app/src/prerender-routes.txt');
const source = readFileSync(docsPath, 'utf8');

const slugs = Array.from(source.matchAll(/slug:\s*'([^']+)'/g), match => match[1]);
const routes = ['/', ...slugs.map(slug => `/services/${slug}`)];

writeFileSync(outputPath, routes.join('\n') + '\n');
