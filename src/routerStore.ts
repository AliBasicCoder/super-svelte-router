import type { SvelteComponent } from "svelte";
import { writable, derived } from "svelte/store";

type objString = { [key: string]: string };

interface MetadataRoute {
  metadata: true;
  defaultLoading?: SvelteComponent;
  defaultAuthComponent?: SvelteComponent;
}

interface LayoutRoute {
  layout: true | number;
  component: SvelteComponent;
}

interface LazyRoute {
  path: string;
  lazyLoad: {
    component: () => Promise<SvelteComponent>;
    loading?: SvelteComponent | string | false;
  };
}

interface StaticRoute {
  path: string;
  component: SvelteComponent | string;
}

interface ProtectedRouteBase {
  authenticator: () => boolean | Promise<boolean>;
  authComponent?: SvelteComponent | string | false;
  authRedirect?: string;
}

type ProtectedStaticRoute = StaticRoute & ProtectedRouteBase;
type ProtectedLazyRoute = LazyRoute & ProtectedRouteBase;
type ProtectedRoute = ProtectedLazyRoute | ProtectedStaticRoute;

type Route =
  | MetadataRoute
  | LayoutRoute
  | StaticRoute
  | LazyRoute
  | ProtectedStaticRoute
  | ProtectedLazyRoute;

type Route2 =
  | StaticRoute
  | LazyRoute
  | ProtectedStaticRoute
  | ProtectedLazyRoute;

interface RouterStoreValue {
  pathname: string;
  params: objString;
  loadingStatus: "none" | "pending" | "error";
  authStatus: "none" | "pending" | "fail" | "error";
  component?: SvelteComponent;
  layout?: SvelteComponent;
  error?: Error;
  targetName?: string;
  currentRoute: Route2;
  routes: Route[];
}

const isLazyRoute = (obj: any): obj is LazyRoute => obj.lazyLoad !== undefined;
const isStaticRoute = (obj: any): obj is StaticRoute =>
  obj.component !== undefined;
const isMetadataRoute = (obj: any): obj is MetadataRoute =>
  obj.metadata === true;
const isLayoutRoute = (obj: any): obj is LayoutRoute =>
  obj.layout !== undefined;
const isProtectedRoute = (obj: any): obj is ProtectedRoute =>
  obj.authenticator !== undefined;

const defaultValue: RouterStoreValue = {
  pathname: "",
  params: {},
  authStatus: "none",
  loadingStatus: "none",
  component: undefined,
  layout: undefined,
  error: undefined,
  targetName: undefined,
  // a placeholder
  // @ts-ignore
  currentRoute: { path: "", component: undefined },
  routes: [],
};

function routerStoreCreator() {
  const { subscribe, update } = writable(defaultValue);

  return {
    subscribe,
    update(newValue: Partial<RouterStoreValue>) {
      update((value) => ({ ...value, ...newValue }));
    },
    renderRoute(
      route: Route2,
      metadata?: MetadataRoute
    ): Partial<RouterStoreValue> {
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
          typeof route.lazyLoad.loading === "string"
            ? route.lazyLoad.loading
            : undefined,
        loadingStatus: "pending",
      };
    },
    render(value: RouterStoreValue, pathname: string): RouterStoreValue {
      let component;
      let targetName;
      let error;
      let authStatus: RouterStoreValue["authStatus"] = "none";
      let loadingStatus: RouterStoreValue["loadingStatus"] = "none";
      let allowShowing = true;
      const [route, params, metadata, layout] = getRoute(
        pathname,
        value.routes
      );
      if (!route) {
        return { ...value, pathname };
      }
      if (isProtectedRoute(route)) {
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
        // @ts-ignore
        targetName,
        error,
        authStatus,
        // @ts-ignore
        loadingStatus,
        pathname,
        params,
        currentRoute: route,
        layout: layout?.component,
        ...(allowShowing && this.renderRoute(route, metadata)),
      };
    },
    redirect(pathname: string, replace?: boolean) {
      updateHistory(pathname, replace);
      update((value) => this.render(value, pathname));
    },
    setRoutes(routes: Route[], pathname: string) {
      update((value) => this.render({ ...value, routes }, pathname));
    },
  };
}

function updateHistory(pathname: string, replace?: boolean) {
  replace
    ? history.replaceState(undefined, document.title, pathname)
    : history.pushState(undefined, document.title, pathname);
}

export const routerStore = routerStoreCreator();

export const isActive = derived(routerStore, ($routerStore) => (path: string) =>
  $routerStore.currentRoute.path === path
);

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    routerStore.redirect(window.location.pathname);
  });
}

function getRoute(
  pathname: string,
  routes: Route[]
): [Route2 | undefined, objString, MetadataRoute?, LayoutRoute?] {
  let params: objString = {};
  let notFoundRoute: Route2 | undefined;
  let metadataRoute: MetadataRoute | undefined;
  let layoutRoute: LayoutRoute | undefined;
  let layoutRouteFor: number | undefined;

  const pathnameParts = pathname.split("/");
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (isLayoutRoute(route)) {
      layoutRoute = route;
      typeof route.layout === "number" && (layoutRouteFor = route.layout);
      continue;
    }
    if (isMetadataRoute(route)) {
      metadataRoute = route;
      continue;
    }
    params = {};
    if (!isProtectedRoute(route) && route.path === "**") {
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
        params[routePart.slice(1)] = decodeURI(pathnamePart || "");
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
export function* LO(...args: string[][]) {
  const len = Math.max.apply(
    undefined,
    args.map((arg) => arg.length)
  );
  for (let i = 0; i < len; i++) {
    const result: (string | undefined)[] = [];
    for (let y = 0; y < args.length; y++) {
      result.push(args[y][i]);
    }
    yield result;
  }
}
