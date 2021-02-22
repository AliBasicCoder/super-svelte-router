import { writable } from "svelte/store";

const defaultValue = {
  pathname: window.location.pathname,
  params: {},
  authStatus: 0,
  loadingStatus: 0,
  error: undefined,
  routes: [],
};

function routerStoreCreator() {
  const { subscribe, update } = writable(defaultValue);

  return {
    subscribe,
    update(newValue) {
      update((value) => ({ ...value, ...newValue }));
    },
    renderRoute(route) {
      if (!route.lazyLoad) {
        this.update({ component: route.component });
        return;
      }
      this.update({ component: route.lazyLoad.loading });
      route.lazyLoad
        .component()
        .then((md) => this.update({ component: md.default }))
        .catch((error) => {
          this.update({ error, loadingStatus: -1 });
          console.error(error);
        });
    },
    render(value, pathname) {
      let component;
      let error;
      let authStatus = "none";
      let loadingStatus = "none";
      let allowShowing = true;
      const [routeIndex, params] = getRoute(pathname, value.routes);
      if (routeIndex === undefined) {
        return { ...value, pathname };
      }
      const route = value.routes[routeIndex];
      if (route.authenticator) {
        const authResult = route.authenticator();
        if (authResult instanceof Promise) {
          allowShowing = false;
          authStatus = "pending";
          component = route.authComponent;
          authResult
            .then((authResult) => {
              this.update({ authStatus: authResult ? "none" : "fail" });
              authResult && this.renderRoute(route);
            })
            .catch((error) => {
              this.update({ error, authStatus: "error" });
              console.error(error);
            });
        } else {
          allowShowing = !!authResult;
          authStatus = authResult ? "none" : "fail";
          !authResult && (component = route.authComponent);
        }
      }
      if (allowShowing) {
        if (route.lazyLoad) {
          component = route.lazyLoad.loading;
          loadingStatus = "pending";
          route.lazyLoad
            .component()
            .then((md) =>
              this.update({ component: md.default, loadingStatus: "none" })
            )
            .catch((error) => {
              this.update({ error, loadingStatus: "error" });
              console.error(error);
            });
        } else {
          component = route.component;
        }
      }
      return {
        routes: value.routes,
        component,
        error,
        authStatus,
        loadingStatus,
        pathname,
        params,
      };
    },
    redirect(pathname, replace) {
      if (replace) history.replaceState(undefined, undefined, pathname);
      else history.pushState(undefined, undefined, pathname);

      update((value) => this.render(value, pathname));
    },
    setRoutes(routes) {
      update((value) => this.render({ ...value, routes }, value.pathname));
    },
  };
}

export const routerStore = routerStoreCreator();

window.addEventListener("popstate", () => {
  routerStore.redirect(window.location.pathname);
});

function getRoute(pathname, routes) {
  let params = {};
  let notFoundIndex;
  const pathnameParts = pathname.split("/");
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    params = {};
    if (route.path === "**") {
      notFoundIndex = i;
      continue;
    }
    let matches = true;
    const routeParts = route.path.split("/");
    if (routeParts.length !== pathnameParts.length) continue;
    for (const [routePart, pathnamePart] of LO(routeParts, pathnameParts)) {
      if (routePart.startsWith(":")) {
        params[routePart.slice(1)] = decodeURI(pathnamePart);
        continue;
      }
      if (routePart !== pathnamePart) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return [i, params];
    }
  }
  return [notFoundIndex, params];
}

/**
 * LO stands for LoopOver
 * @param  {...Array<string>} args
 */
export function* LO(...args) {
  const len = Math.max.apply(
    undefined,
    args.map((arg) => arg.length)
  );
  for (let i = 0; i < len; i++) {
    const result = [];
    for (let y = 0; y < args.length; y++) {
      result.push(args[y][i]);
    }
    yield result;
  }
}
