<script>
  import { link } from "../../";
  export let params;
</script>

{#if params.title === undefined}
  <a href="/blog/Blog1/hi there" use:link>Blog1</a>
{:else}
  <h1>Blog: {params.title}</h1>
  <p>{params.text}</p>
{/if}
