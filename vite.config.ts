import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const localApiPort = env.LOCAL_API_PORT || "3001";

  return {
    server: {
      host: "::",
      port: 3000,
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${localApiPort}`,
          changeOrigin: true,
        },
      },
      allowedHosts: [
        "localhost",
        "127.0.0.1",
        ".ngrok-free.app",
        ".ngrok.io"
      ],
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "es2015",
      minify: "esbuild"
    }
  };
});
