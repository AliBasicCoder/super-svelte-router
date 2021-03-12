import { writable, derived } from "svelte/store";

const isLazyRoute = (obj) => obj.lazyLoad;
const isStaticRoute = (obj) => obj.component;
const isMetadataRoute = (obj) => obj.metadata;

const defaultValue = {
  pathname: "",
  params: {},
  authStatus: "none",
  loadingStatus: "none",
  component: undefined,
  layout: undefined,
  error: undefined,
  targetName: undefined,
  currentRoute: undefined,
  routes: [],
};

function routerStoreCreator() {
  const { subscribe, update } = writable(defaultValue);
  return {
    subscribe,
    update(newValue) {
      update((value) => ({ ...value, ...newValue }));
    },
    renderRoute(route, metadata) {
      if (!isLazyRoute(route)) {
        return typeof route.component === "string"
          ? { targetName: route.component }
          : { component: route.component };
      }
      route.lazyLoad
        .component()
        .then((md) =>
          this.update({ component: md.default, targetName: undefined })
        )
        .catch((error) => {
          this.update({ error, loadingStatus: "error" });
          console.error(error);
        });
      return {
        component:
          route.lazyLoad.loading === false ||
          typeof route.lazyLoad.loading === "string"
            ? undefined
            : route.lazyLoad.loading || metadata?.defaultLoading,
        targetName:
          typeof route.lazyLoad.loading === "string" && route.lazyLoad.loading,
        loadingStatus: "pending",
      };
    },
    render(value, pathname) {
      let component;
      let targetName;
      let error;
      let authStatus = "none";
      let loadingStatus = "none";
      let allowShowing = true;
      const [route, params, metadata, layout] = getRoute(
        pathname,
        value.routes
      );
      if (!route) {
        return { ...value, pathname };
      }
      if (route.authenticator) {
        const authResult = route.authenticator();
        if (authResult instanceof Promise) {
          allowShowing = false;
          authStatus = "pending";
          route.authComponent !== false &&
            (component = route.authComponent || metadata?.defaultAuthComponent);
          authResult
            .then((authResult) => {
              if (route.authRedirect && !authResult) {
                this.redirect(route.authRedirect);
                return;
              }
              this.update({
                authStatus: authResult ? "none" : "fail",
                ...(authResult && this.renderRoute(route, metadata)),
              });
            })
            .catch((error) => {
              console.error(error);
              route.authRedirect
                ? this.redirect(route.authRedirect)
                : this.update({ error, authStatus: "error" });
            });
        } else {
          if (route.authRedirect && !authResult) {
            updateHistory(route.authRedirect, false);
            return this.render(value, route.authRedirect);
          }
          allowShowing = !!authResult;
          authStatus = authResult ? "none" : "fail";
          !authResult &&
            route.authComponent !== false &&
            (component = route.authComponent);
        }
      }
      if (typeof component === "string") {
        targetName = component;
        component = undefined;
      }
      return {
        routes: value.routes,
        component,
        targetName,
        error,
        authStatus,
        loadingStatus,
        pathname,
        params,
        currentRoute: route,
        layout: layout?.component,
        ...(allowShowing && this.renderRoute(route, metadata)),
      };
    },
    redirect(pathname, replace) {
      updateHistory(pathname, replace);
      update((value) => this.render(value, pathname));
    },
    setRoutes(routes, pathname) {
      update((value) => this.render({ ...value, routes }, pathname));
    },
  };
}

function updateHistory(pathname, replace) {
  replace
    ? history.replaceState(undefined, document.title, pathname)
    : history.pushState(undefined, document.title, pathname);
}

export const routerStore = routerStoreCreator();

export const isActive = derived(routerStore, ($routerStore) => (path) =>
  $routerStore.currentRoute.path === path
);

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    routerStore.redirect(window.location.pathname);
  });
}

function getRoute(pathname, routes) {
  let params = {};
  let notFoundRoute;
  let metadataRoute;
  let layoutRoute;
  let layoutRouteFor;

  const pathnameParts = pathname.split("/");
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (typeof route.layout === "number" || route.layout === true) {
      layoutRoute = route;
      typeof route.layout === "number" && (layoutRouteFor = route.layout);
      continue;
    }
    if (isMetadataRoute(route)) {
      metadataRoute = route;
      continue;
    }
    params = {};
    if (isStaticRoute(route) && route.path === "**") {
      notFoundRoute = route;
      continue;
    }
    let matches = true;
    const routeParts = route.path.split("/");
    for (const [routePart, pathnamePart] of LO(routeParts, pathnameParts)) {
      if (
        (pathnamePart === undefined && routePart === "") ||
        (routePart === undefined && pathnamePart === "")
      )
        continue;
      if (routePart?.startsWith(":")) {
        params[routePart.slice(1)] = decodeURI(pathnamePart);
        continue;
      }
      if (routePart !== pathnamePart) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return [route, params, metadataRoute, layoutRoute];
    }
    if (layoutRoute && layoutRouteFor !== undefined) {
      layoutRouteFor--;
      if (layoutRouteFor === 0) {
        layoutRoute = undefined;
        layoutRouteFor = undefined;
      }
    }
  }
  return [notFoundRoute, params, metadataRoute, layoutRoute];
}

/** LO stands for LoopOver */
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
