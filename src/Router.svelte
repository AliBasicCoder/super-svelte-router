<script>
  import { routerStore } from "./routerStore.js";

  export let routes;
  export let noProps = false;
  export let initialPathname =
    typeof window !== "undefined" ? window.location.pathname : "/";

  $: routerStore.setRoutes(routes, initialPathname);
</script>

{#if noProps && $routerStore.layout}
  <svelte:component this={$routerStore.layout}>
    <svelte:component this={$routerStore.component} />
  </svelte:component>
{:else if $routerStore.layout}
  <svelte:component this={$routerStore.layout} {...$routerStore}>
    <svelte:component this={$routerStore.component} {...$routerStore} />
  </svelte:component>
{:else if noProps}
  <svelte:component this={$routerStore.component} />
{:else}
  <svelte:component this={$routerStore.component} {...$routerStore} />
{/if}

<slot />
