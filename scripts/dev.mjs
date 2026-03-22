import { spawn } from "node:child_process";

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

const procs = [];

const start = (args, name) => {
  const proc = spawn(npmCmd, args, {
    stdio: "inherit",
    env: process.env,
  });
  proc.on("exit", (code) => {
    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
    }
    shutdown();
    process.exit(code ?? 0);
  });
  procs.push(proc);
};

const shutdown = () => {
  for (const proc of procs) {
    if (!proc.killed) {
      proc.kill();
    }
  }
};

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});

start(["run", "dev:api"], "api");
start(["run", "dev:vite"], "vite");

