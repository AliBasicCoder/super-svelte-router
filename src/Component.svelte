<script>
  import { onDestroy } from "svelte";
  import { routerStore } from "./routerStore.js";

  export let name;
  let routerStoreValue;

  const unsubscribe = routerStore.subscribe(
    (value) => (routerStoreValue = value)
  );

  onDestroy(unsubscribe);
</script>

{#if routerStoreValue.targetName === name}
  <slot
    loadingStatus={routerStoreValue.loadingStatus}
    authStatus={routerStoreValue.authStatus}
    params={routerStoreValue.params}
    pathname={routerStoreValue.pathname}
    error={routerStoreValue.error}
  />
{/if}
