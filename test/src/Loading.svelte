<script>
  export let loadingStatus;
  export let error;
</script>

<h1 id="text">
  {#if loadingStatus === 0}
    Loading...
  {:else if loadingStatus === -1}
    Error
  {/if}
</h1>

<div>
  {#if loadingStatus === -1}
    error
    <div id="data">{error}</div>
  {/if}
</div>
