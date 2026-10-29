import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const fix = process.argv.includes("--fix");

const files = new Set(
  execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root, encoding: "utf-8" }
  ).split("\0")
);

const failures = [];
let checked = 0;

for (const file of files) {
  const absolute = path.join(root, file);

  if (!/\.(?:[cm]?[jt]sx?|css|mdx)$/u.test(file) || !existsSync(absolute)) {
    continue;
  }

  const source = readFileSync(absolute, "utf-8");
  const mdx = file.endsWith(".mdx");

  const frontmatter = mdx
    ? /^---\n[\s\S]*?\n---\n/u.exec(source)?.[0]
    : undefined;

  const body = source.slice(frontmatter?.length ?? 0);

  const noticePattern = mdx
    ? /^\{\/\*[\s\S]*?\*\/\}/gmu
    : /^\/\*[\s\S]*?\*\//gmu;

  const notices = [...body.matchAll(noticePattern)].filter(([comment]) =>
    /Copyright|Derived from|Modified for|@license/u.test(comment)
  );

  if (notices.length === 0) {
    continue;
  }

  const comments = new Set(notices.map(([comment]) => comment));

  const code = body
    .replaceAll(
      new RegExp(`${noticePattern.source}[\\t ]*\\n*`, "gmu"),
      (comment) => (comments.has(comment.trimEnd()) ? "" : comment)
    )
    .trimStart();

  const prefix =
    frontmatter === undefined ? "" : `${frontmatter.trimEnd()}\n\n`;

  const normalized = `${prefix}${notices.map(([comment]) => comment).join("\n")}\n\n${code}`;

  checked += 1;

  if (source !== normalized) {
    if (fix) {
      writeFileSync(absolute, normalized);
    } else {
      failures.push(`${file}: put notices first, followed by one blank line`);
    }
  }
}

assert.deepEqual(failures, [], failures.join("\n"));

console.info(`License notice placement verified in ${checked} files.`);
