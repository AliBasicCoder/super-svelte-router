<script>
  import { routerStore } from "./routerStore.js";

  export let name;
</script>

{#if $routerStore.targetName === name}
  <slot
    loadingStatus={$routerStore.loadingStatus}
    authStatus={$routerStore.authStatus}
    params={$routerStore.params}
    pathname={$routerStore.pathname}
    error={$routerStore.error}
  />
{/if}
