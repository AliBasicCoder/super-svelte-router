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
      name,
    },
    {
      file: "dist/index.js",
      format: "umd",
      name,
    },
  ],
  plugins: [
    typescript({
      strict: true,
      target: "es2017",
      module: "es2015",
      tsconfig: false,
    }),
    svelte(),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
  ],
};
