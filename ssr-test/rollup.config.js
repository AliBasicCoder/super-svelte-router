import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import superSvelteRouter from "../rollup-plugin/rollupPlugin";
import css from "rollup-plugin-css-only";

const mode = process.env.NODE_ENV;
const dev = mode !== "production";
const legacy = !dev;

export const config = (input, fileOrDir, client) => ({
  input,
  output: {
    file: !client && fileOrDir,
    dir: client && fileOrDir,
    format: client ? (legacy ? "system" : "module") : "commonjs",
  },
  preserveEntrySignatures: !client,
  plugins: [
    superSvelteRouter({ client }),
    svelte({
      compilerOptions: {
        dev,
        generate: client ? "dom" : "ssr",
        hydratable: true,
      },
    }),
    css({ output: "bundle.css" }),
    resolve({
      dedupe: ["svelte"],
    }),
    commonjs(),
  ],
});

export default [
  config("_fake.js", "public/build", true),
  config("_fake.js", "public/build/ssr.js", false),
];
