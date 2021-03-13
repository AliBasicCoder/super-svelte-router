import { convertRoutes } from "./convert";
import path from "path";
import fs from "fs";

let first = false;

const defaultOptions = {
  appPath: "./src/App.svelte",
  routesPath: "./super-svelte-router.json",
};

export default function superSvelteRouter(options = defaultOptions) {
  return {
    name: "super-svelte-router",
    async load() {
      if (first) return null;
      first = true;
      const file = await fs.promises.readFile(
        path.join(process.cwd(), options.routesPath),
        "utf8"
      );
      return convertRoutes(file, options.appPath);
    },
  };
}
