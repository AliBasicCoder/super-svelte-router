<script>
  export let authenticationResult;
</script>

<h1 id="text">
  {#if authenticationResult === 0}
    Checking if you authenticated
  {:else if authenticationResult === -1}
    Sorry, you are NOT authenticated
  {/if}
</h1>
