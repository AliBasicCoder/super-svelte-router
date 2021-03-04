import { routerStore, isActive } from "./routerStore";

/**
 * @param {HTMLLinkElement} node
 * @param {string} href
 */
export function link(node, href) {
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
 * @param {MouseEvent} e
 */
export function linkHandler(e) {
  e.preventDefault();
  routerStore.redirect(new URL(e.target.href).pathname);
}

/**
 * @deprecated use routerStore.redirect instead
 * @param {string} path
 * @param {boolean?} replace
 */
export function redirect(path, replace) {
  routerStore.redirect(path, replace);
}

export { routerStore, isActive };
export { default as Router } from "./Router.svelte";
export { default as Component } from "./Component.svelte";
