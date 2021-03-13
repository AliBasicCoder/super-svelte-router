<script>
  import { isActive, link } from "super-svelte-router";
</script>

<header>
  <div class="link" class:active={$isActive("/")}>
    <a href="/" use:link>Main</a>
  </div>
  <div class="link" class:active={$isActive("/about")}>
    <a href="/" use:link>About</a>
  </div>
  <div
    class="link"
    class:active={$isActive("/blog/:title/:text") || $isActive("/blog")}
  >
    <a href="/" use:link>Blog</a>
  </div>
</header>
<main>
  <slot />
</main>

<style>
  .link {
    padding: 10px;
    cursor: pointer;
  }
  .link.active {
    border-bottom: 2px solid green;
  }
</style>
