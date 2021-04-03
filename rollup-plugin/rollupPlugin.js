import { convertRoutes } from "./convert";
import path from "path";
import fs from "fs";

const defaultOptions = {
  appPath: "./src/App.svelte",
  routesPath: "./super-svelte-router.json",
  client: false,
};

export default function superSvelteRouter(options = defaultOptions) {
  let firstId;
  options = { ...defaultOptions, ...options };

  return {
    name: "super-svelte-router",
    async load(id) {
      if (firstId === undefined) firstId = id;
      if (firstId !== id) return null;

      const routesFile = await fs.promises.readFile(
        path.join(process.cwd(), options.routesPath),
        "utf8"
      );
      const jsFile = await fs.promises.readFile(id, "utf8");

      const result = convertRoutes(
        routesFile,
        jsFile,
        options.appPath,
        options.client
      );

      console.log(result);
      return result;
    },
  };
}
