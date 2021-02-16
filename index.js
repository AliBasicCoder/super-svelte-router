export { default as Router } from "./Router.svelte";

function createRedirectEvent(pathname, replace) {
  return new CustomEvent("super-svelte-router-redirect-event", {
    detail: { pathname, replace },
  });
}

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

export function linkHandler(e) {
  e.preventDefault();
  window.dispatchEvent(createRedirectEvent(new URL(e.target.href).pathname));
}

/**
 * @param {string} path
 * @param {boolean | undefined} replace
 */
export function redirect(path, replace) {
  window.dispatchEvent(createRedirectEvent(path, replace));
}
