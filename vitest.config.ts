import {defineConfig} from "vitest/config";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";

const root=dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test:{
    environment:"jsdom",
    globals:true,
    setupFiles:["./src/test/setup.ts"],
    include:["tests/**/*.{test,spec}.{ts,tsx}","src/**/*.{test,spec}.{ts,tsx}"]
  },
  resolve:{alias:{"@":resolve(root,"./src")}}
});
