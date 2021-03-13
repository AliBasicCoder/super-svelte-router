/**
 * @param {string} routesFile
 * @param {string} appPath
 * @returns {string}
 */
export function convertRoutes(routesFile, appPath, client) {
  const routes = JSON.parse(routesFile);
  let resultTop = `import App from "${appPath}";\n`;
  let resultBottom = "const routes = [\n";
  const map = new Map();

  for (const route of routes) {
    if (map.has(route.component)) continue;
    map.set(route.component);
    const componentId = `File${Math.random().toString().slice(2).slice(0, 5)}`;

    if (!client) {
      resultTop += `import ${componentId} from "${route.component}";\n`;

      if (route.layout) {
        resultBottom += `  { layout: ${route.layout}, component: ${componentId} },\n`;
      } else {
        resultBottom += `  { path: "${route.path}", component: ${componentId} },\n`;
      }
    } else {
      if (route.layout) {
        resultTop += `import ${componentId} from "${route.component}";\n`;
        resultBottom += `  { layout: ${route.layout}, component: ${componentId} },\n`;
      } else {
        resultBottom += `  { path: "${route.path}", lazyLoad: { component: () => import("${route.component}") } },\n`;
      }
    }
  }

  resultBottom += "]";

  return (
    `${resultTop}\n\n${resultBottom};\n\n` +
    (client
      ? "new App({ target: document.body, props: { routes, initialPathname: window.location.pathname } });"
      : "export { App, routes }")
  );
}
