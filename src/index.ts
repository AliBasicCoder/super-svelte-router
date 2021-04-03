import { routerStore, isActive } from "./routerStore";

export function link(node: HTMLLinkElement, href?: string) {
  href && (node.href = href);
  node.addEventListener("click", linkHandler);
  return {
    destroy() {
      node.removeEventListener("click", linkHandler);
    },
  };
}

export function linkHandler(e: MouseEvent) {
  e.preventDefault();
  routerStore.redirect(
    // @ts-ignore
    new URL(e.target.href).pathname
  );
}

export function redirect(path: string, replace?: boolean) {
  routerStore.redirect(path, replace);
}

type SSR_auth = { [key: string]: () => boolean | Promise<boolean> };

export const SSR = {
  auth: {} as SSR_auth,
  setAuth(auth: SSR_auth) {
    this.auth = auth;
  },
  getAuth(): SSR_auth {
    return this.auth;
  },
};

export { routerStore, isActive };
export { default as Router } from "./Router.svelte";
export { default as Component } from "./Component.svelte";
