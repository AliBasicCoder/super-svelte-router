<script>
  import {
    Router,
    Component,
    link,
    routerStore,
    isActive,
  } from "super-svelte-router";
  import { routes } from "./routes";

  let inputVal;
  let updateOnEnter = true;
  let updateOnType = false;
  let decodeUri = false;

  function go() {
    if (decodeUri)
      routerStore.redirect(
        inputVal.split("/").map(encodeURIComponent).join("/")
      );
    else routerStore.redirect(inputVal);
  }

  function keyup(e) {
    if (updateOnType) go();
    if (updateOnEnter && e.key === "Enter") go();
  }
</script>

<div>
  <h3>super-svelte-router test</h3>
  <p>route: {$routerStore.pathname}</p>
  <div class="result">
    {#each routes as route}
      {#if !route.metadata && !route.layout}
        <a href={route.path} use:link>{route.path}</a>
      {/if}
    {/each}

    <div id="isActive" class:red={$isActive("/")}>I'm red</div>

    <div id="target">
      <Router {routes}>
        <Component name="loading" let:loadingStatus let:error>
          <h1 id="text">
            Inline {#if loadingStatus === "pending"}
              Loading...
            {:else}
              Error
            {/if}
          </h1>
          <div id="data">{error}</div>
        </Component>
        <Component name="auth" let:authStatus>
          <h1 id="text">
            Inline {#if authStatus === "pending"}
              Checking if you authenticated
            {:else}
              Sorry, you are NOT authenticated
            {/if}
          </h1>
        </Component>
        <Component name="protected" let:params>
          <h1 id="text">Inline Protected</h1>
          <div>
            my params are <div id="data">{JSON.stringify(params)}</div>
          </div>
        </Component>
        <Component name="inline" let:params>
          <h1 id="text">Inline Params</h1>
          <div>
            my params are <div id="data">{JSON.stringify(params)}</div>
          </div>
        </Component>
      </Router>
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
  .result a {
    margin-right: 5px;
  }
  .red {
    color: red;
  }
</style>
