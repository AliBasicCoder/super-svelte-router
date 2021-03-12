<script>
  export let params;
</script>

<div id="layout">
  <slot />
  <div id="layout-data">{JSON.stringify(params)}</div>
</div>

<style>
  #layout {
    border: 2px solid black;
    padding: 20px;
  }
</style>
