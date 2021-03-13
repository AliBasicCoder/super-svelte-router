<script>
  import { Router } from "super-svelte-router";

  export let routes;
  export let initialPathname;
</script>

<Router {routes} {initialPathname} />