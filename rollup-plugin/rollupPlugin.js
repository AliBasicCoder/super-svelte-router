import { convertRoutes } from "./convert";
import path from "path";
import fs from "fs";

const defaultOptions = {
  appPath: "./src/App.svelte",
  routesPath: "./super-svelte-router.json",
  client: false,
};

export default function superSvelteRouter(options = defaultOptions) {
  let first = false;
  options = { ...defaultOptions, ...options };

  return {
    name: "super-svelte-router",
    async load() {
      if (first) return null;
      first = true;
      const file = await fs.promises.readFile(
        path.join(process.cwd(), options.routesPath),
        "utf8"
      );
      const result = convertRoutes(file, options.appPath, options.client);

      return result;
    },
  };
}
