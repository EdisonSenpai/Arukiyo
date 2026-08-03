import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const h3Dist = path.join(projectRoot, "node_modules", "h3-js", "dist");

if (!fs.existsSync(h3Dist)) {
  throw new Error(
    `h3-js nu a fost gasit la ${h3Dist}. Ruleaza mai intai npm install.`,
  );
}

const sourceFiles = [];

function collectFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectFiles(fullPath);
      continue;
    }

    if (/\.(cjs|js|mjs)$/.test(entry.name)) {
      sourceFiles.push(fullPath);
    }
  }
}

collectFiles(h3Dist);

let changedFiles = 0;
let replacements = 0;
let remainingUnsupportedReferences = 0;

for (const filePath of sourceFiles) {
  const original = fs.readFileSync(filePath, "utf8");

  const patched = original
    .replace(
      /new\s+TextDecoder\(\s*(["'])utf-16le\1\s*\)/gi,
      () => {
        replacements += 1;
        return "undefined";
      },
    )
    .replace(
      /new\s+TextDecoder\(\s*(["'])utf16le\1\s*\)/gi,
      () => {
        replacements += 1;
        return "undefined";
      },
    );

  if (patched !== original) {
    fs.writeFileSync(filePath, patched, "utf8");
    changedFiles += 1;
  }

  if (/new\s+TextDecoder\(\s*(["'])utf-?16le\1\s*\)/i.test(patched)) {
    remainingUnsupportedReferences += 1;
  }
}

if (remainingUnsupportedReferences > 0) {
  throw new Error(
    `Au ramas ${remainingUnsupportedReferences} fisiere h3-js cu TextDecoder utf-16le.`,
  );
}

if (changedFiles > 0) {
  console.log(
    `h3-js Hermes hotfix aplicat: ${replacements} inlocuiri in ${changedFiles} fisiere.`,
  );
} else {
  console.log(
    "h3-js Hermes hotfix era deja aplicat; nu au fost necesare modificari.",
  );
}
