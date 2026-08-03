import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const appJsonPath = path.join(projectRoot, "app.json");

const config = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

config.expo ??= {};
config.expo.plugins ??= [];

const pluginName = "@maplibre/maplibre-react-native";

const pluginExists = config.expo.plugins.some((plugin) => {
  if (typeof plugin === "string") {
    return plugin === pluginName;
  }

  return Array.isArray(plugin) && plugin[0] === pluginName;
});

if (!pluginExists) {
  config.expo.plugins.push(pluginName);
}

fs.writeFileSync(
  appJsonPath,
  `${JSON.stringify(config, null, 2)}\n`,
  "utf8",
);

console.log("app.json configurat pentru MapLibre.");
