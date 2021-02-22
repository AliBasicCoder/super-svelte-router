<script>
  import { routerStore } from "super-svelte-router";
</script>

<h1 id="text">I'm Lazy</h1>
<div>
  my params are <div id="data">{JSON.stringify($routerStore.params)}</div>
</div>
