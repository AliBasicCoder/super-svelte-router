import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const name = "superSvelteRouter";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.mjs",
      format: "es",
      sourcemap: true,
      name,
    },
    {
      file: "dist/index.js",
      format: "umd",
      sourcemap: true,
      name,
    },
  ],
  plugins: [
    typescript(),
    svelte(),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
  ],
};
