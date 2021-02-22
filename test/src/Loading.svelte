<script>
  import { routerStore } from "super-svelte-router";
</script>

<h1 id="text">
  {#if $routerStore.loadingStatus === "pending"}
    Loading...
  {:else}
    Error
  {/if}
</h1>

<div>
  {#if $routerStore.loadingStatus === "error"}
    error
    <div id="data">{$routerStore.error}</div>
  {/if}
</div>
