import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = join(projectRoot, 'dist');
const publicEntries = ['index.html', 'assets', 'css', 'js'];

rmSync(outputDirectory, { force: true, recursive: true });
mkdirSync(outputDirectory, { recursive: true });

for (const entry of publicEntries) {
  cpSync(join(projectRoot, entry), join(outputDirectory, entry), {
    recursive: true,
  });
}

console.log(`Prepared ${outputDirectory}`);
