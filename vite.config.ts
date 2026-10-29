import { fileURLToPath, URL } from "node:url";
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const fromSrc = (folder: string) => fileURLToPath(new URL(`./src/${folder}`, import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  // React Compiler memoises components and hooks automatically, so no useMemo/useCallback.
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    // One alias per folder (also set in tsconfig.json).
    alias: {
      "@components": fromSrc("components"),
      "@hooks": fromSrc("hooks"),
      "@pages": fromSrc("pages"),
      "@typedefs": fromSrc("types"),
      "@utils": fromSrc("utils"),
    },
  },
});
