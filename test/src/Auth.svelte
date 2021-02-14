<script>
  export let authStatus;
</script>

<h1 id="text">
  {#if authStatus === 0}
    Checking if you authenticated
  {:else if authStatus === -1}
    Sorry, you are NOT authenticated
  {/if}
</h1>
