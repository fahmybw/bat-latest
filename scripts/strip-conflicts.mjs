import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const SKIP_DIRS = new Set([".git", "node_modules", "dist", ".vercel"]);
const MARKER_REGEX = /^(<<<<<<<|=======|>>>>>>>)/m;
const CODEx_BRANCH_REGEX = /codex\/deploy-bat-app-to-github-and-vercel/i;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      files.push(...(await walk(join(dir, entry.name))));
    } else {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

const files = await walk(ROOT);

await Promise.all(
  files.map(async (file) => {
    const content = await readFile(file, "utf8");
    if (!MARKER_REGEX.test(content) && !CODEx_BRANCH_REGEX.test(content)) return;
    const cleaned = content
      .split("\n")
      .filter(
        (line) =>
          !line.startsWith("<<<<<<<") &&
          !line.startsWith("=======") &&
          !line.startsWith(">>>>>>>") &&
          !CODEx_BRANCH_REGEX.test(line)
      )
      .join("\n");
    await writeFile(file, cleaned, "utf8");
  })
);
