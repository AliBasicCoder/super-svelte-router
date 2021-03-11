<script>
  import { routerStore } from "./routerStore.js";

  export let routes;
  export let noProps;
  export let initialPathname =
    typeof window !== "undefined" ? window.location.pathname : "/";

  $: routerStore.setRoutes(routes, initialPathname);
</script>

{#if noProps}
  <svelte:component this={$routerStore.component} />
{:else}
  <svelte:component this={$routerStore.component} {...$routerStore} />
{/if}

<slot />
