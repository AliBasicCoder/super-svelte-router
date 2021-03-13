import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import superSvelteRouter from "../rollup-plugin/rollupPlugin";

const mode = process.env.NODE_ENV;
const dev = mode === "development";

export const config = (input, file, bool) => ({
  input,
  output: {
    file,
    format: "commonjs",
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev,
        generate: "ssr",
        hydratable: true,
      },
      emitCss: false,
    }),
    resolve({
      dedupe: ["svelte"],
    }),
    commonjs(),
    bool && superSvelteRouter(),
  ],
});

export default [config("ssr.js", "build/ssr.js", true)];
