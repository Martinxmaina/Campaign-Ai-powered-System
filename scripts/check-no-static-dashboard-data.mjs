import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("src/app/(dashboard)");
const ALLOWLIST = new Set([
  "src/app/(dashboard)/admin/audit-trail/page.tsx",
  "src/app/(dashboard)/parties/[id]/page.tsx",
  "src/app/(dashboard)/research/intel-form/page.tsx",
  "src/app/(dashboard)/settings/page.tsx",
  "src/app/(dashboard)/surveys/[id]/page.tsx",
  "src/app/(dashboard)/surveys/new/page.tsx",
  "src/app/(dashboard)/surveys/page.tsx",
]);

const ARRAY_DECLARATION = /^const\s+\w+\s*=\s*\[/m;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return [full];
    }),
  );
  return files.flat();
}

const files = (await walk(ROOT)).filter((file) => file.endsWith("page.tsx"));
const offenders = [];

for (const file of files) {
  const relative = file.replace(`${process.cwd()}/`, "");
  if (ALLOWLIST.has(relative)) continue;
  const contents = await readFile(file, "utf8");
  if (ARRAY_DECLARATION.test(contents)) offenders.push(relative);
}

if (offenders.length > 0) {
  console.error("Mock-style top-level arrays detected in dashboard route files:");
  offenders.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log("No top-level dashboard mock data arrays detected.");
