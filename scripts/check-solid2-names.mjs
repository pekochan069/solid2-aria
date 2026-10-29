import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const legacyName = /solid[-_]?(?:aria|stately|types)/iu;

const files = new Set(
  execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root, encoding: "utf-8" }
  )
    .split("\0")
    .filter(Boolean)
);

const failures = [];

let checked = 0;

for (const file of files) {
  const absolute = path.join(root, file);

  if (!existsSync(absolute)) {
    continue;
  }

  if (legacyName.test(file)) {
    failures.push(`${file}: legacy name in path`);
  }

  // Preserve contributor instructions and verbatim third-party attribution.
  if (
    path.basename(file) === "AGENTS.md" ||
    path.basename(file) === "NOTICE.txt" ||
    /(?:^|\/)LICENSES?(?:[/.]|$)/u.test(file)
  ) {
    continue;
  }

  const source = readFileSync(absolute, "utf-8");

  const content = source
    .replaceAll(/\/\*[\s\S]*?\*\//gu, (comment) =>
      /Copyright|Derived from|Modified for/u.test(comment) ? "" : comment
    )
    // Attribution checks also refer to the original modification notice.
    .replaceAll("Modified for Solid Aria:", "");

  if (legacyName.test(content)) {
    failures.push(`${file}: legacy name outside attribution notices`);
  }

  checked += 1;
}

assert.deepEqual(failures, [], failures.join("\n"));

console.info(`Solid2 naming verified in ${checked} files.`);
