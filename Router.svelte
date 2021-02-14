<script>
  import { loopOver } from "./util";
  /**
   * @typedef {Object} LazyLoadOption
   * @property {() => Promise<any>} component - a function returning the lazy loaded component
   * @property {string | undefined} key - the component's exported key "default" by default
   * @property {any | undefined} whileLoading - display a component while the lazy loaded component is loading
   * @property {any | undefined} ifFailed - display a component if failed loading component
   */

  /**
   * @typedef {Object} Route
   * @property {string} path - the route
   * @property {any} component - the svelte component
   * @property {() => boolean | Promise<boolean>} authenticator - a function if allow accessing the route only if returns true
   * @property {() => any | Promise<any>} authenticatorComponent
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
    component = route.lazyLoad?.whileLoading || route.component;
    route.lazyLoad
      ?.component()
      .then((md) => (component = md[route.lazyLoad.key || "default"]))
      .catch((err) => {
        error = err;
        route.lazyLoad.ifFailed && (component = route.lazyLoad.ifFailed);
      });
  }

  let component;
  let notFoundComponent;
  let params = {};
  let error;
  let authenticationResult = 0;
  $: {
    params = {};
    component = undefined;
    authenticationResult = 0;
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
          component = route.authenticatorComponent;
          authResult.then((authResult) => {
            authenticationResult = authResult ? 1 : -1;
            authResult && renderRoute(route);
          });
          break;
        }
        authenticationResult = authResult ? 1 : -1;
        !authResult && (component = route.authenticatorComponent);
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
  {authenticationResult}
/>
