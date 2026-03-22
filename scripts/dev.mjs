import { spawn } from "node:child_process";
import net from "node:net";

const procs = [];

const isPortFree = (port) =>
  new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", () => resolve(false));
    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });
    tester.listen({
      port,
      host: "::",
      exclusive: true,
    });
  });

const findFreePort = async (startPort, maxChecks = 30) => {
  for (let i = 0; i < maxChecks; i += 1) {
    const candidate = startPort + i;
    // eslint-disable-next-line no-await-in-loop
    const free = await isPortFree(candidate);
    if (free) return candidate;
  }
  throw new Error(`No free port found starting at ${startPort}`);
};

const start = (command, name, extraEnv = {}) => {
  const proc = spawn(command, {
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
    shell: true,
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

const main = async () => {
  const basePort = Number(process.env.LOCAL_API_PORT || 3001);
  const chosenPort = await findFreePort(basePort);
  const sharedEnv = { LOCAL_API_PORT: String(chosenPort) };

  if (chosenPort !== basePort) {
    console.log(`[dev] LOCAL_API_PORT ${basePort} busy, using ${chosenPort}`);
  } else {
    console.log(`[dev] LOCAL_API_PORT ${chosenPort}`);
  }

  start("npm run dev:api", "api", sharedEnv);
  start("npm run dev:vite", "vite", sharedEnv);
};

main().catch((error) => {
  console.error(`[dev] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
