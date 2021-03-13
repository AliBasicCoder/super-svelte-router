import { convertRoutes } from "./convert";
import path from "path";
import fs from "fs";

let first = false;

export default function superSvelteRouter({
  appPath = "./src/App.svelte",
  routesPath = "./super-svelte-router.json",
}) {
  return {
    name: "super-svelte-router",
    async load() {
      if (first) return null;
      first = true;
      const file = await fs.promises.readFile(
        path.join(process.cwd(), routesPath),
        "utf8"
      );
      return convertRoutes(file, appPath);
    },
  };
}
