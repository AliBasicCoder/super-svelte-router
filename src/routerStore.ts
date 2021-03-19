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

interface DeprecatedLazyRoute {
  path: string;
  lazyLoad: {
    component: () => Promise<SvelteComponent>;
    loading?: SvelteComponent | string | false;
  };
}

interface LazyRoute {
  path: string;
  lazyLoad: true;
  component: () => Promise<SvelteComponent>;
  loading?: SvelteComponent | string | false;
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
type DeprecatedProtectedLazyRoute = DeprecatedLazyRoute & ProtectedRouteBase;
type ProtectedLazyRoute = LazyRoute & ProtectedRouteBase;
type ProtectedRoute = ProtectedLazyRoute | ProtectedStaticRoute;

type Route = Route3 | DeprecatedLazyRoute | DeprecatedProtectedLazyRoute;

type Route2 =
  | StaticRoute
  | LazyRoute
  | ProtectedStaticRoute
  | ProtectedLazyRoute;

type Route3 = Route2 | MetadataRoute | LayoutRoute;

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
  routes: Route3[];
}

const isDeprecatedLazyRoute = (obj: any): obj is DeprecatedLazyRoute =>
  typeof obj.lazyLoad === "object";
const isLazyRoute = (obj: any): obj is LayoutRoute => obj.lazyLoad === true;
const isStaticRoute = (obj: any): obj is StaticRoute =>
  obj.component !== undefined && !obj.lazyLoad;
const isMetadataRoute = (obj: any): obj is MetadataRoute =>
  obj.metadata === true;
const isLayoutRoute = (obj: any): obj is LayoutRoute =>
  typeof obj.layout === "number" || obj.layout === true;
const isProtectedRoute = (obj: any): obj is ProtectedRoute =>
  typeof obj.authenticator === "function";

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

function convertLazy(
  oldLazyRoute: DeprecatedLazyRoute,
  noWarn = false
): LazyRoute {
  if (!noWarn)
    console.warn(
      `super-svelte-router: passed deprecated formatting for LazyLoaded routes support for this format will be dropped by v2.0.0`
    );

  return {
    path: oldLazyRoute.path,
    lazyLoad: true,
    // @ts-ignore
    component: oldLazyRoute.lazyLoad.component,
    loading: oldLazyRoute.lazyLoad.loading,
  };
}

function convertDeprecated(route: Route): Route3 {
  if (isDeprecatedLazyRoute(route)) {
    if (isProtectedRoute(route))
      return {
        ...convertLazy(route),
        authenticator: route.authenticator,
        authComponent: route.authComponent,
        authRedirect: route.authRedirect,
      };

    return convertLazy(route);
  }
  return route;
}

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
      if (isStaticRoute(route)) {
        return typeof route.component === "string"
          ? { targetName: route.component }
          : { component: route.component };
      }
      route
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
          route.loading === false || typeof route.loading === "string"
            ? undefined
            : route.loading || metadata?.defaultLoading,
        targetName:
          typeof route.loading === "string" ? route.loading : undefined,
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
      update((value) =>
        this.render(
          { ...value, routes: routes.map(convertDeprecated) },
          pathname
        )
      );
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
  routes: Route3[]
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
