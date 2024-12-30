import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { updatePackegeDotJson } from "./updates.js";

const filesToCopy = [
  "package.json",
  ".env",
  "src/config.json",
  "src/firebase.json"
];

const directoriesToCopy = [
];

/* const directoriesToCopy = [
  "src/templates"
];
 */

const copyFile = async (sourcePath, destPath) => {
  try {
    console.log("\x1b[34m%s\x1b[0m", `Reading file from: ${sourcePath}`);
    const fileContent = await fs.readFile(sourcePath, "utf-8");

    console.log("\x1b[34m%s\x1b[0m", `Writing file to: ${destPath}`);
    await fs.writeFile(destPath, fileContent);

    console.log("\x1b[32m%s\x1b[0m", `Successfully processed: ${path.basename(sourcePath)}`);
  } catch (fileError) {
    console.error("\x1b[31m%s\x1b[0m", `Error processing file ${path.basename(sourcePath)}:`);
    console.error(fileError);
  }
};

const copyDir = async (sourceDir, destDir) => {
  try {
    await fs.mkdir(destDir, { recursive: true });
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        await copyDir(sourcePath, destPath);
      } else {
        await copyFile(sourcePath, destPath);
      }
    }
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", `Error processing directory ${sourceDir}:`);
    console.error(error);
  }
};

const process = async () => {
  try {
    console.log("\x1b[34m%s\x1b[0m", "Starting process...");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const sourceDir = path.resolve(__dirname, "..");
    const destDir = path.resolve(__dirname, "..", "dist");

    await fs.mkdir(destDir, { recursive: true });

    // Copy individual files
    for (const file of filesToCopy) {
      const sourceFilePath = path.join(sourceDir, file);
      const destFilePath = path.join(destDir, path.basename(file));
      await copyFile(sourceFilePath, destFilePath);
    }

    // Copy directories
    for (const dir of directoriesToCopy) {
      const sourceDirPath = path.join(sourceDir, dir);
      const destDirPath = path.join(destDir, path.basename(dir));
      await copyDir(sourceDirPath, destDirPath);
    }

    console.log("\x1b[32m%s\x1b[0m", "All files processed!");
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "An error occurred:");
    console.error(error);
  }
};

await process();
await updatePackegeDotJson();
console.log("Script execution finished.");