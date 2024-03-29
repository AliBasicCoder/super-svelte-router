import { routerStore, isActive } from "./routerStore";

export function link(node: HTMLAnchorElement, href?: string) {
  href && (node.href = href);
  if (node.localName !== "a") {
    // @ts-ignore
    node = node.parentNode;
  }
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

export { routerStore, isActive };
export { default as Router } from "./Router.svelte";
export { default as Component } from "./Component.svelte";
