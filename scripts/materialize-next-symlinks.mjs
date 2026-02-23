import fs from "node:fs";
import path from "node:path";

const nextNodeModulesDir = path.join(process.cwd(), ".next", "node_modules");

if (!fs.existsSync(nextNodeModulesDir)) {
  console.log("[materialize-next-symlinks] .next/node_modules not found, skipping.");
  process.exit(0);
}

const entries = fs.readdirSync(nextNodeModulesDir);
let materialized = 0;

for (const entry of entries) {
  const entryPath = path.join(nextNodeModulesDir, entry);
  let stats;
  try {
    stats = fs.lstatSync(entryPath);
  } catch {
    continue;
  }

  if (!stats.isSymbolicLink()) {
    continue;
  }

  const realTargetPath = fs.realpathSync(entryPath);
  fs.rmSync(entryPath, { recursive: true, force: true });
  fs.cpSync(realTargetPath, entryPath, { recursive: true, dereference: true });
  materialized += 1;
  console.log(`[materialize-next-symlinks] ${entry} -> ${realTargetPath}`);
}

if (materialized === 0) {
  console.log("[materialize-next-symlinks] No symlinks found.");
}
