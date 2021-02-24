import { routerStore } from "./routerStore";
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
 */
export function linkHandler(e) {
    e.preventDefault();
    routerStore.redirect(new URL(e.target?.href).pathname);
}
/**
 * @deprecated use routerStore.redirect instead
 */
export function redirect(path, replace) {
    routerStore.redirect(path, replace);
}
export { routerStore };
export { default as Router } from "./Router.svelte";
