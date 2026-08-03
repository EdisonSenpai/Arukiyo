import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const packageJsonPath = path.join(projectRoot, "package.json");
const patchScript = "node ./scripts/patch-h3-hermes.mjs";

const packageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, "utf8"),
);

packageJson.scripts ??= {};

const existingPostinstall = packageJson.scripts.postinstall;

if (!existingPostinstall) {
  packageJson.scripts.postinstall = patchScript;
} else if (!existingPostinstall.includes("patch-h3-hermes.mjs")) {
  packageJson.scripts.postinstall =
    `${existingPostinstall} && ${patchScript}`;
}

fs.writeFileSync(
  packageJsonPath,
  `${JSON.stringify(packageJson, null, 2)}\n`,
  "utf8",
);

execFileSync(
  process.execPath,
  [path.join(projectRoot, "scripts", "configure-stage2b.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  },
);

execFileSync(
  process.execPath,
  [path.join(projectRoot, "scripts", "patch-h3-hermes.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  },
);

console.log(
  "Hotfix Stage 2B instalat. Patch-ul H3 va fi reaplicat automat dupa fiecare npm install.",
);
