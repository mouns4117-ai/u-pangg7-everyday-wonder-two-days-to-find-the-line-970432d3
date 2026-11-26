import { mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ENTRY =
  "The kettle clicked off at the exact second the rain stopped, and for one breath I believed my kitchen had negotiated with the sky.";

// Fail-fast gate validation: one sentence, 1-200 chars, not only whitespace.
if (!ENTRY || ENTRY.trim().length === 0) {
  throw new Error("entry is empty");
}
if (ENTRY.length > 200) {
  throw new Error(`entry too long: ${ENTRY.length} chars (max 200)`);
}
if ((ENTRY.match(/\./g) ?? []).length !== 1 || !ENTRY.endsWith(".")) {
  throw new Error("entry must be exactly one sentence");
}
// The gate counts characters, but the file is UTF-8: refuse multi-byte surprises
// and any embedded newline so the entry stays one line, one sentence.
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (Buffer.byteLength(ENTRY, "utf8") !== ENTRY.length) {
  throw new Error("entry must be plain ASCII so char count equals byte count");
}

mkdirSync("/output", { recursive: true });
// Empty /output's CONTENTS only; never remove the directory itself (mounted dir).
for (const f of readdirSync("/output")) {
  rmSync(`/output/${f}`, { recursive: true, force: true });
}
writeFileSync("/output/entry.txt", ENTRY, "utf8");

// Read-back verification: the file must hold exactly the entry.
const back = readFileSync("/output/entry.txt", "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch");
}
const sha = createHash("sha256").update(back, "utf8").digest("hex");
console.log(`wrote /output/entry.txt (${ENTRY.length} chars, sha256 ${sha})`);
