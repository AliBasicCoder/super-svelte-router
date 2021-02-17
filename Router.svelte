<script>
  import Auth from "./test/src/Auth.svelte";
  import { routerStore } from "./util";

  /**
   * @typedef {Object} LazyLoadOption
   * @property {() => Promise<any>} component - a function returning the lazy loaded component
   * @property {any | undefined} loading - display a component while the lazy loaded component is loading
   */

  /**
   * @typedef {Object} Route
   * @property {string} path - the route
   * @property {any} component - the svelte component
   * @property {() => boolean | Promise<boolean>} authenticator - a function if allow accessing the route only if returns true
   * @property {() => any | Promise<any>} authComponent
   * @property {LazyLoadOption | undefined} lazyLoad
   */
  /** @type {Route[]} */
  export let routes;
  /** @type {boolean} */
  export let noProps;

  $: routerStore.setRoutes(routes);
</script>

{#if noProps}
  <svelte:component this={$routerStore.component} />
{:else}
  <svelte:component this={$routerStore.component} {...$routerStore} />
{/if}
