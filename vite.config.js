import { defineConfig } from "vite";

export default defineConfig({
  input: "public/server/index.js",
  build: {
    minify: false,
    lib: {
      entry: "public/server/index.js",
      name: "MyLib",
    },
  },
});