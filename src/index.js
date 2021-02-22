import { routerStore } from "./routerStore";

/**
 * @param {HTMLLinkElement} node
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
 * @param {boolean | undefined} replace
 */
export function redirect(path, replace) {
  routerStore.redirect(path, replace);
}

export { routerStore };
export { default as Router } from "./Router.svelte";