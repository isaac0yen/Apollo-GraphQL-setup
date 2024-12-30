import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const updatePackegeDotJson = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const packageJsonPath = path.join(__dirname, "../dist/package.json");
  const packegeDotJson = JSON.parse(readFileSync(packageJsonPath));
  packegeDotJson.type = "commonjs";
  writeFileSync(packageJsonPath, JSON.stringify(packegeDotJson, null, 2));
};

