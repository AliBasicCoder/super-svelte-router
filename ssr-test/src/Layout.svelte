<script>
  import { isActive, link } from "super-svelte-router";
</script>

<header>
  <a class="link" href="/" use:link class:active={$isActive("/")}> Main </a>
  <a class="link" href="/about" use:link class:active={$isActive("/about")}>
    About
  </a>
  <a
    class="link"
    class:active={$isActive("/blog/:title/:text") || $isActive("/blog")}
    href="/blog"
    use:link
  >
    Blog
  </a>
</header>
<main>
  <slot />
</main>

<style>
  .link {
    padding: 10px;
    cursor: pointer;
    display: inline-block;
    color: black;
    text-decoration: none;
  }
  .link.active {
    border-bottom: 2px solid green;
  }
</style>
