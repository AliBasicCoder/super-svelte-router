<script>
  import { loopOver } from "./util";
  /**
   * @typedef {Object} LazyLoadOption
   * @property {() => Promise<any>} component - a function returning the lazy loaded component
   * @property {any | undefined} loading - display a component while the lazy loaded component is loading
   */

  /**
   * @typedef {Object} Route
   * @property {string} path - the route
   * @property {any} component - the svelte component
   * @property {() => boolean | Promise<boolean>} authenticator - a function if allow accessing the route only if returns true
   * @property {() => any | Promise<any>} authComponent
   * @property {LazyLoadOption | undefined} lazyLoad
   */
  /** @type {Route[]} */
  export let routes;
  export let pathname = window.location.pathname;

  window.addEventListener("super-svelte-router-redirect-event", (e) => {
    pathname = e.detail;
    history.pushState(undefined, undefined, pathname);
  });

  window.addEventListener("popstate", () => {
    pathname = window.location.pathname;
  });

  /** @param {Route} route */
  function renderRoute(route) {
    component = route.lazyLoad?.loading || route.component;
    route.lazyLoad
      ?.component()
      .then((md) => (component = md.default))
      .catch((err) => {
        error = err;
        loadingStatus = -1;
        console.error(error);
      });
  }

  let component;
  let notFoundComponent;
  let params = {};
  let error;
  let authStatus = 0;
  let loadingStatus = 0;
  $: {
    params = {};
    component = undefined;
    authStatus = 0;
    loadingStatus = 0;
    for (const route of routes) {
      if (route.path === "**") {
        notFoundComponent = route.component;
        continue;
      }
      const routeParts = route.path.split("/");
      const pathnameParts = pathname.split("/");
      if (routeParts.length !== pathnameParts.length) continue;
      let matches = true;
      for (const [routePart, pathnamePart] of loopOver(
        routeParts,
        pathnameParts
      )) {
        if (routePart.startsWith(":")) {
          params[routePart.slice(1)] = decodeURI(pathnamePart);
          continue;
        }
        if (routePart !== pathnamePart) {
          matches = false;
          break;
        }
      }
      if (!matches) continue;
      if (route.authenticator) {
        const authResult = route.authenticator();
        if (authResult instanceof Promise) {
          component = route.authComponent;
          authResult
            .then((authResult) => {
              authStatus = authResult ? 1 : -1;
              authResult && renderRoute(route);
            })
            .catch((err) => {
              error = err;
              authStatus = -1;
              console.error(error);
            });
          break;
        }
        authStatus = authResult ? 1 : -1;
        !authResult && (component = route.authComponent);
        authResult && renderRoute(route);
        break;
      }
      renderRoute(route);
      break;
    }
  }
</script>

<svelte:component
  this={component || notFoundComponent}
  {params}
  {error}
  {authStatus}
  {loadingStatus}
/>
