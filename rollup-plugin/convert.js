/**
 * @param {string} routesFile
 * @param {string} appPath
 * @returns {string}
 */
export function convertRoutes(routesFile, appPath) {
  const routes = JSON.parse(routesFile);
  let resultTop = `import App from "${appPath}";\n`;
  let resultBottom = "const routes = [\n";
  const map = new Map();

  for (const route of routes) {
    if (map.has(route.component)) continue;
    map.set(route.component);
    const componentId = `File${Math.random().toString().slice(2).slice(0, 5)}`;
    resultTop += `import ${componentId} from "${route.component}";\n`;

    if (route.layout) {
      resultBottom += `  { layout: ${route.layout}, component: ${componentId} },\n`;
    } else {
      resultBottom += `  { path: "${route.path}", component: ${componentId} },\n`;
    }
  }

  resultBottom += "]";

  return `${resultTop}\n\n${resultBottom};\n\nexport { App, routes }`;
}
