import Main from "./main.svelte";
import Params from "./params.svelte";
import NotFound from "./NotFound.svelte";
import WhileLoading from "./whileLoading.svelte";
import ifFailed from "./ifFailed.svelte";
import Protected from "./Protected.svelte";
import Auth from "./Auth.svelte";

function wait(ms, value, rej) {
  return new Promise((resolve, reject) =>
    setTimeout(() => (rej ? reject(value) : resolve(value)), ms)
  );
}

export const routes = [
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
      whileLoading: WhileLoading,
    },
  },
  {
    path: "/lazy-pr/:param",
    lazyLoad: {
      component: () => wait(1000, import("./lazyLoad.svelte")),
      whileLoading: WhileLoading,
    },
  },
  {
    path: "/lazy-fail",
    lazyLoad: {
      component: () => wait(1000, "a fail", true),
      whileLoading: WhileLoading,
      ifFailed,
    },
  },
  {
    path: "/protected-wait-false",
    authenticator: () => wait(1000, false),
    authenticatorComponent: Auth,
    component: Protected,
  },
  {
    path: "/protected-wait-true/:param",
    authenticator: () => wait(1000, true),
    authenticatorComponent: Auth,
    component: Protected,
  },
  {
    path: "/protected-false",
    authenticator: () => false,
    authenticatorComponent: Auth,
    component: Protected,
  },
  {
    path: "/protected-true/:param",
    authenticator: () => true,
    authenticatorComponent: Auth,
    component: Protected,
  },
  {
    path: "**",
    component: NotFound,
  },
];
