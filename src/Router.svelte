<script>
  import { routerStore } from "./routerStore.js";

  export let routes;
  export let noProps;

  $: routerStore.setRoutes(routes);
</script>

{#if noProps}
  <svelte:component this={$routerStore.component} />
{:else}
  <svelte:component this={$routerStore.component} {...$routerStore} />
{/if}
