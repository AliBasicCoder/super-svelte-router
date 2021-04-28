const randId = () => `File${Math.random().toString().slice(2).slice(0, 5)}`;

function addToMap(map, id, onlyIf = true) {
  if (!id) return "";
  if (map.has(id)) return "";
  const componentId = randId();
  map.set(id, componentId);
  if (onlyIf) return `import ${componentId} from "${id}";\n`;
  return "";
}

/**
 * @param {string} routesFile
 * @param {string} appPath
 * @returns {string}
 */
export function convertRoutes(routesFile, jsFile, appPath, client) {
  const routes = JSON.parse(routesFile);
  let resultTop = `import __APP__ from "${appPath}";\n`;
  let resultBottom = "const __AUTH__ = SSR.getAuth();\nconst __ROUTES__ = [\n";
  const map = new Map();

  for (const route of routes) {
    if (route.metadata) {
      resultTop += addToMap(map, route.defaultLoading);
      resultTop += addToMap(map, route.defaultAuthComponent);
      resultBottom +=
        `  { metadata: true,` +
        (route.defaultLoading
          ? ` defaultLoading: ${map.get(route.defaultLoading)},`
          : "") +
        (route.defaultAuthComponent
          ? ` defaultAuthComponent: ${map.get(route.defaultAuthComponent)}`
          : "") +
        " },\n";
      continue;
    }
    resultTop += addToMap(map, route.component, !client || route.layout);
    resultTop += addToMap(map, route.loading);
    resultTop += addToMap(map, route.authComponent);
    const componentId = map.get(route.component);

    resultBottom +=
      "  { " +
      (route.layout ? `layout: ${route.layout},` : `path: "${route.path}",`) +
      " component: " +
      (!client || route.layout
        ? `${componentId},`
        : `() => import("${route.component}"), lazyLoad: true,`) +
      (route.loading ? ` loading: ${map.get(route.loading)},` : "") +
      (route.authComponent
        ? ` authComponent: ${map.get(route.authComponent)},`
        : "") +
      (route.authenticator
        ? ` authenticator: __AUTH__["${route.authenticator}"],`
        : "") +
      (route.authRedirect ? ` authRedirect: "${route.authRedirect}",` : "") +
      " },\n";
  }

  resultBottom += "]";

  return (
    `${jsFile}\n\n${resultTop}\n\n${resultBottom};\n\n` +
    (client
      ? "new __APP__({ target: document.body, props: { routes: __ROUTES__, initialPathname: window.location.pathname }, hydrate: true });"
      : "export { __APP__ as App, __ROUTES__ as routes }")
  );
}
