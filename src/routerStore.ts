import type { SvelteComponent } from "svelte";
import { Writable, writable } from "svelte/store";

type Object<T> = { [key: string]: T };

interface MetadataRoute {
  metadata: true;
  defaultAuthComponent?: SvelteComponent;
  defaultLoading?: SvelteComponent;
}

interface RouteShared {
  path: string;
  authenticator?: () => Promise<boolean> | boolean;
  authComponent?: SvelteComponent | false;
}

interface StaticRoute extends RouteShared {
  component: SvelteComponent;
}

interface LazyRoute extends RouteShared {
  lazyLoad: {
    component: () => Promise<{ default: SvelteComponent }>;
    loading?: SvelteComponent | false;
  };
}

type Route = StaticRoute | LazyRoute | MetadataRoute;

const isLazyRoute = (obj: any): obj is LazyRoute => obj.lazyLoad;
const isStaticRoute = (obj: any): obj is StaticRoute => obj.component;
const isMetadataRoute = (obj: any): obj is MetadataRoute => obj.metadata;

interface RouterStore {
  subscribe: Writable<RouterStoreValue>["subscribe"];
  update(newValue: Partial<RouterStoreValue>): void;
  renderRoute(
    route: StaticRoute | LazyRoute,
    metadata: MetadataRoute | undefined
  ): Partial<RouterStoreValue>;
  render(value: RouterStoreValue, pathname: string): RouterStoreValue;
  redirect(pathname: string, replace?: boolean): void;
  setRoutes(routes: Route[]): void;
}

interface RouterStoreValue {
  component: SvelteComponent | undefined;
  pathname: string;
  params: Object<string>;
  authStatus: "none" | "pending" | "fail" | "error";
  loadingStatus: "none" | "pending" | "error";
  error: Error | undefined;
  routes: Route[];
}

const defaultValue: RouterStoreValue = {
  pathname: window.location.pathname,
  params: {},
  authStatus: "none",
  loadingStatus: "none",
  component: undefined,
  error: undefined,
  routes: [],
};

function routerStoreCreator(): RouterStore {
  const { subscribe, update } = writable(defaultValue);

  return {
    subscribe,
    update(newValue) {
      update((value) => ({ ...value, ...newValue }));
    },
    renderRoute(route, metadata) {
      if (!isLazyRoute(route)) {
        return { component: route.component };
      }

      route.lazyLoad
        .component()
        .then((md) => this.update({ component: md.default }))
        .catch((error) => {
          this.update({ error, loadingStatus: "error" });
          console.error(error);
        });

      return {
        component:
          route.lazyLoad.loading === false
            ? undefined
            : route.lazyLoad.loading || metadata?.defaultLoading,
        loadingStatus: "pending",
      };
    },
    render(value, pathname) {
      let component: SvelteComponent | undefined;
      let error: Error | undefined;
      let authStatus: RouterStoreValue["authStatus"] = "none";
      let loadingStatus: RouterStoreValue["loadingStatus"] = "none";
      let allowShowing = true;

      const [route, params, metadata] = getRoute(pathname, value.routes);
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
              this.update({
                authStatus: authResult ? "none" : "fail",
                ...(authResult && this.renderRoute(route, metadata)),
              });
            })
            .catch((error) => {
              this.update({ error, authStatus: "error" });
              console.error(error);
            });
        } else {
          allowShowing = !!authResult;
          authStatus = authResult ? "none" : "fail";
          !authResult &&
            route.authComponent !== false &&
            (component = route.authComponent);
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
        ...(allowShowing && this.renderRoute(route, metadata)),
      };
    },
    redirect(pathname, replace) {
      if (replace) history.replaceState(undefined, document.title, pathname);
      else history.pushState(undefined, document.title, pathname);

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

function getRoute(
  pathname: string,
  routes: Route[]
): [
  LazyRoute | StaticRoute | undefined,
  Object<string>,
  MetadataRoute | undefined
] {
  let params: Object<string> = {};
  let notFoundRoute: StaticRoute | undefined;
  let metadataRoute: MetadataRoute | undefined;
  const pathnameParts = pathname.split("/");
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
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
      return [route, params, metadataRoute];
    }
  }
  return [notFoundRoute, params, metadataRoute];
}

/**
 * LO stands for LoopOver
 */
export function* LO(...args: string[][]) {
  const len = Math.max.apply(
    undefined,
    args.map((arg) => arg.length)
  );
  for (let i = 0; i < len; i++) {
    const result: string[] = [];
    for (let y = 0; y < args.length; y++) {
      result.push(args[y][i]);
    }
    yield result;
  }
}
