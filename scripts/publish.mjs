import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const libraryDir = path.join(rootDir, 'projects', 'ngx-core');
const distDir = path.join(rootDir, 'dist', 'ngx-core');
const packageJsonPath = path.join(libraryDir, 'package.json');
const bump = process.argv[2] || 'patch';

function run(args, cwd) {
	if (process.platform === 'win32') {
		execFileSync('cmd.exe', ['/d', '/s', '/c', 'npm.cmd', ...args], {
			cwd,
			stdio: 'inherit'
		});
		return;
	}

	execFileSync('npm', args, {
		cwd,
		stdio: 'inherit'
	});
}

function getVersion() {
	return JSON.parse(readFileSync(packageJsonPath, 'utf8')).version;
}

if (process.env.npm_command === 'publish') {
	console.error('Use "npm run publish" at the repo root. Do not run "npm publish" here.');
	process.exit(1);
}

if (!existsSync(packageJsonPath)) {
	console.error(`Missing library package file: ${packageJsonPath}`);
	process.exit(1);
}

const previousVersion = getVersion();
console.log(`Current version: ${previousVersion}`);
console.log(`Bumping version with: ${bump}`);
run(['version', bump, '--no-git-tag-version'], libraryDir);

const nextVersion = getVersion();
console.log(`Building ngx-core ${nextVersion}`);
run(['run', 'build'], rootDir);

if (!existsSync(distDir)) {
	console.error(`Build output not found: ${distDir}`);
	process.exit(1);
}

console.log(`Publishing ${distDir}`);
run(['publish', distDir], rootDir);
