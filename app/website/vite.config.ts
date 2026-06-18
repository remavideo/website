import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackStart({
      srcDirectory: "app",
      router: {
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
    }),
    nitro(
      process.env.VERCEL
        ? { preset: "vercel" }
        : {
            output: {
              dir: "dist",
            },
          },
    ),
    react(),
    tsconfigPaths(),
  ],
});
