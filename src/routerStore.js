import { writable } from "svelte/store";
const isLazyRoute = (obj) => obj.lazyLoad;
const isStaticRoute = (obj) => obj.component;
const isMetadataRoute = (obj) => obj.metadata;
const defaultValue = {
    pathname: window.location.pathname,
    params: {},
    authStatus: "none",
    loadingStatus: "none",
    component: undefined,
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
                component: route.lazyLoad.loading === false
                    ? undefined
                    : route.lazyLoad.loading || metadata?.defaultLoading,
                loadingStatus: "pending",
            };
        },
        render(value, pathname) {
            let component;
            let error;
            let authStatus = "none";
            let loadingStatus = "none";
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
                }
                else {
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
            if (replace)
                history.replaceState(undefined, document.title, pathname);
            else
                history.pushState(undefined, document.title, pathname);
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
    let notFoundRoute;
    let metadataRoute;
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
        if (routeParts.length !== pathnameParts.length)
            continue;
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
export function* LO(...args) {
    const len = Math.max.apply(undefined, args.map((arg) => arg.length));
    for (let i = 0; i < len; i++) {
        const result = [];
        for (let y = 0; y < args.length; y++) {
            result.push(args[y][i]);
        }
        yield result;
    }
}
