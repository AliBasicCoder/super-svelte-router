import Main from "./main.svelte";
import Params from "./params.svelte";
import NotFound from "./NotFound.svelte";
import Loading from "./Loading.svelte";
import Loading2 from "./Loading2.svelte";
import Protected from "./Protected.svelte";
import Auth from "./Auth.svelte";

function wait(ms, value, rej) {
  return new Promise((resolve, reject) =>
    setTimeout(() => (rej ? reject(value) : resolve(value)), ms)
  );
}

export const routes = [
  {
    metadata: true,
    defaultLoading: Loading2,
  },
  {
    path: "/",
    component: Main,
  },
  {
    path: "/foo/:param",
    component: Params,
  },
  {
    path: "/foo/:pr1/bar/:pr2/bla/:pr3",
    component: Params,
  },
  {
    path: "/lazy",
    lazyLoad: {
      component: () => wait(1000, import("./lazyLoad.svelte")),
      loading: Loading,
    },
  },
  {
    path: "/lazy-default",
    lazyLoad: {
      component: () => wait(2000, import("./lazyLoad.svelte")),
    },
  },
  {
    path: "/lazy-pr/:param",
    lazyLoad: {
      component: () => wait(1000, import("./lazyLoad.svelte")),
      loading: Loading,
    },
  },
  {
    path: "/lazy-fail",
    lazyLoad: {
      component: () => wait(1000, "a fail", true),
      loading: Loading,
    },
  },
  {
    path: "/protected-wait-false",
    authenticator: () => wait(1000, false),
    authComponent: Auth,
    component: Protected,
  },
  {
    path: "/protected-wait-true/:param",
    authenticator: () => wait(1000, true),
    authComponent: Auth,
    component: Protected,
  },
  {
    path: "/protected-false",
    authenticator: () => false,
    authComponent: Auth,
    component: Protected,
  },
  {
    path: "/protected-true/:param",
    authenticator: () => true,
    authComponent: Auth,
    component: Protected,
  },
  {
    path: "/inline",
    component: "inline",
  },
  {
    path: "/inline-pr/:param",
    component: "inline",
  },
  {
    path: "/inline-protected-wait-false",
    authenticator: () => wait(1000, false),
    authComponent: Auth,
    component: "protected",
  },
  {
    path: "/inline-protected-wait-true/:param",
    authenticator: () => wait(1000, true),
    authComponent: "auth",
    component: "protected",
  },
  {
    path: "/inline-protected-false",
    authenticator: () => false,
    authComponent: "auth",
    component: Protected,
  },
  {
    path: "/inline-protected-true/:param",
    authenticator: () => true,
    authComponent: Auth,
    component: "protected",
  },
  {
    path: "/inline-loading/:param",
    lazyLoad: {
      component: () => wait(1000, import("./lazyLoad.svelte")),
      loading: "loading",
    },
  },
  {
    path: "/inline-loading-fail",
    lazyLoad: {
      component: () => wait(1000, "a fail", true),
      loading: "loading",
    },
  },
  {
    path: "**",
    component: NotFound,
  },
];
