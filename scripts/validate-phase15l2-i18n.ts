// Phase 15L.2 i18n contract audit.
// Reports candidate orphan keys but never deletes or fails on them: dynamic
// lookups and persisted contracts require human review before key removal.

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { EN_US } from "../src/i18n/en-US";
import { PT_BR } from "../src/i18n/pt-BR";

const ROOT = process.cwd();
const sourceFiles = ["src", "scripts"];

function collectFiles(path: string): string[] {
  const absolute = join(ROOT, path);
  try {
    const stat = statSync(absolute);
    if (stat.isFile()) return [absolute];
    return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) =>
      collectFiles(join(path, entry.name)),
    );
  } catch {
    return [];
  }
}

const files = sourceFiles.flatMap(collectFiles).filter((file) => /\.(ts|tsx)$/.test(file));
const source = files
  .filter((file) => !file.endsWith("src/i18n/pt-BR.ts") && !file.endsWith("src/i18n/en-US.ts"))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

const ptKeys = Object.keys(PT_BR);
const enKeys = Object.keys(EN_US);
const missingInEnglish = ptKeys.filter((key) => !enKeys.includes(key));
const extraInEnglish = enKeys.filter((key) => !ptKeys.includes(key));
const candidateOrphans = ptKeys.filter((key) => !source.includes(key));

console.log(`Phase 15L.2 i18n contract: ${ptKeys.length} PT-BR keys / ${enKeys.length} EN-US keys`);
console.log(`  locale parity: ${missingInEnglish.length === 0 && extraInEnglish.length === 0 ? "PASS" : "FAIL"}`);
if (missingInEnglish.length) console.log(`  missing in EN-US: ${missingInEnglish.join(", ")}`);
if (extraInEnglish.length) console.log(`  extra in EN-US: ${extraInEnglish.join(", ")}`);
console.log(`  candidate orphan keys requiring human review: ${candidateOrphans.length}`);
if (candidateOrphans.length) console.log(`  ${candidateOrphans.join(", ")}`);

if (missingInEnglish.length || extraInEnglish.length) process.exitCode = 1;
