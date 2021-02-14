<script>
  import { Router, linkHandler, redirect } from "../../index";
  import { routes } from "./routes";

  let inputVal;
  let updateOnEnter = true;
  let updateOnType = false;
  let decodeUri = false;
  let pathname = "/";

  function go() {
    if (decodeUri)
      redirect(inputVal.split("/").map(encodeURIComponent).join("/"));
    else redirect(inputVal);
  }

  function keyup(e) {
    if (updateOnType) go();
    if (updateOnEnter && e.key === "Enter") go();
  }
</script>

<div>
  <h3>super-svelte-router test</h3>
  <p>route: {pathname}</p>
  <div class="result">
    {#each routes as route}
      <a href={route.path} on:click={linkHandler} style="margin-right: 5px"
        >{route.path}</a
      >
    {/each}

    <div id="target">
      <Router {routes} bind:pathname />
    </div>
  </div>
  <div>
    go to route:
    <input bind:value={inputVal} on:keyup={keyup} id="url-input" />
    <button on:click={go}>go</button>
    <br />
    update on type:
    <input type="checkbox" bind:checked={updateOnType} />
    <br />
    update on typing "Enter":
    <input type="checkbox" bind:checked={updateOnEnter} />
    <br />
    decode URI (except slashes):
    <input type="checkbox" bind:checked={decodeUri} />
  </div>
</div>

<style>
  div div.result {
    border: 2px solid;
    padding: 10px;
    margin-bottom: 20px;
  }
  div h3 {
    text-align: center;
  }
</style>
