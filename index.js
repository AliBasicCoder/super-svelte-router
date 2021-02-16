export { default as Router } from "./Router.svelte";

function createRedirectEvent(pathname) {
  return new CustomEvent("super-svelte-router-redirect-event", {
    detail: pathname,
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

export function redirect(path) {
  window.dispatchEvent(createRedirectEvent(path));
}
