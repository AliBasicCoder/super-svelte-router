import { routerStore } from "./routerStore";

export function link(node: HTMLLinkElement, href?: string) {
  href && (node.href = href);
  node.addEventListener("click", linkHandler);
  return {
    destroy() {
      node.removeEventListener("click", linkHandler);
    },
  };
}

/**
 * @deprecated use link action instead
 */
export function linkHandler(e: MouseEvent) {
  e.preventDefault();
  routerStore.redirect(new URL((e.target as HTMLLinkElement)?.href).pathname);
}

/**
 * @deprecated use routerStore.redirect instead
 */
export function redirect(path: string, replace?: boolean) {
  routerStore.redirect(path, replace);
}

export { routerStore };
export { default as Router } from "./Router.svelte";
