<script>
  import { routerStore } from "super-svelte-router";
</script>

<h1 id="text">
  {#if $routerStore.authStatus === "pending"}
    Checking if you authenticated
  {:else}
    Sorry, you are NOT authenticated
  {/if}
</h1>
