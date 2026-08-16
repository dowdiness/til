import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = join("backups", `edge-journal-${timestamp}.sql`);
await mkdir("backups", { recursive: true });

const child = spawn("pnpm", ["exec", "wrangler", "d1", "export", "edge-journal-db", "--remote", "--output", output], {
  stdio: "inherit",
});
child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  if (signal) process.exitCode = 1;
  else process.exitCode = code ?? 1;
});
