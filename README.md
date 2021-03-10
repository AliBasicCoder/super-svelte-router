# super-svelte-router

this project follows [semver](https://semver.org/)

a small, simple router for [svelte](https://github.com/sveltejs/svelte)

# Table of contents

- [Usage](#usage)
- [API](#api)
  - [routerStore](#routerstore)
    - [redirect](#redirect-method)
  - [noProps](#noprops)
  - [Not found routes](#not-found-routes)
  - [Static routes](#static-routes)
  - [Dynamic routes](#dynamic-routes)
  - [Lazy loaded routes](#Lazy-loaded-routes)
    - [loading](#loading)
  - [Protected routes](#protected-routes)
    - [authRedirect](#authredirect)
    - [authComponent](#authcomponent)
  - [Metadata](#metadata)
    - [defaultLoading](#defaultloading)
    - [defaultAuthComponent](defaultauthcomponent)
  - [Component](#component)
  - [isActive](#isactive)
  - [redirect](#redirect)
  - [link](#link)
  - [linkHandler](#linkhandler)
- [Setting up rollup for code splitting](#setting-up-rollup-for-code-splitting)

# Usage

```html
<script>
  import { Router } from "super-svelte-router";

  const routes = [
    {
      path: "**",
      component: NotFound,
    },
    {
      path: "/",
      component: Main,
    },
    {
      path: "/about",
      component: Main,
    },
    {
      path: "/product/:id",
      component: Product,
    },
    {
      path: "/lazy",
      lazyLoad: {
        component: () => import("./Lazy.svelte"),
        Loading: Loading,
      },
    },
    {
      path: "/protected",
      authenticator: () => {
        // some authentication logic
        return true;
        // or if fails
        return false;
      },
      // or
      authenticator: async () => {
        // some async authentication logic
        return true;
        // or if fails
        return false;
      },
      authComponent: authComponent,
      component: Protected,
    },
  ];
</script>

<Router {routes}></Router>
```

# API

## routerStore

routerStore is a custom svelte store that contain the status of the router

Also the Router will pass every property on $routerStore as props

for example you could do this:

```html
<script>
  export let params;

  console.log(params);
</script>
```

instead of:

```html
<script>
  import { routerStore } from "super-svelte-router";

  console.log($routerStore.params);
</script>
```

To prevent that pass noProp prop to the Router

## noProps

```html
<script>
  import { Router } from "super-svelte-router";

  const routes = [...];
</script>

<Router {routes} noProps="{true}"></Router>
```

### redirect method

routerStore.redirect is used for redirecting

example:

```js
import { routerStore } from "super-svelte-router";

routerStore.redirect("/hello");
// to replace instead of push
routerStore.redirect("/hello", true);
```

## Not found routes

DO NOT put more than one 404 route in routes

to use 404 route you set path to \*\* like below

```js
[
  ...
  {
    path: "**",
    component: NotFound
  }
  ...
]
```

example for 404 component

```html
<h1>404 Not Found</h1>
```

## Static routes

DO NOT use `:` in static routes

example:

```js
[
  ...
  {
    path: "/static",
    component: Static
  }
  ...
]
```

example for static component

```html
<h1>I'm static</h1>
```

## Dynamic routes

to use a dynamic route put : before the dynamic part(s) of url
you could have as many dynamic parts as you like

for example:

`/foo/:id`

in this example `:id` could be replaced with anything including `:id`

example for pathname(s) that matches this example

`/foo/100`
`/foo/random-id`
`/foo/:id`
`/foo/` <-- be careful with this one

use [routerStore](#routerstore) to access params

example:

```js
[
  ...
  {
    path: "/foo/:id",
    component: Params
  }
  ...
]
```

example for params component

```html
<script>
  import { routerStore } from "super-svelte-router";

  console.log($routerStore.params); // => { id: "100" }
</script>

<h1>id is {$routerStore.params.id}</h1>
```

## Lazy loaded routes

to use a lazy route you set lazyLoad.component to a function that returns a dynamic import for component

you muse setup rollup first see [Setting up rollup for code splitting](#setting-up-rollup-for-code-splitting)

example:

```js
[
  ...
  {
    path: "/lazy",
    // or lazy with params
    path: "/lazy/:id"
    lazyLoad: {
      component: () => import("./lazy.svelte")
    }
  }
  ...
]
```

### loading

loading is an option to display a component while the lazy-loaded component is loading
or failed loading

if you want to set a default loading component see [defaultLoading](#defaultloading)

[routerStore](#routerstore) value will have these properties:

- loadingStatus
  a string that represents the status of loading
  if `pending` component is still loading
  if `error` loading failed
- error (optional)
  represents an error happened while loading component
- params
  Loading component have access to params

example:

```js
[
  ...
  {
    path: "/lazy",
    lazyLoad: {
      component: () => import("./lazy.svelte"),
      loading: Loading
    }
  }
  ...
]
```

example for Loading component

```html
<script>
  import { routerStore } from "super-svelte-router";
</script>

<h1>
  {#if $routerStore.loadingStatus === "pending"} Loading... {:else if
  $routerStore.loadingStatus === "error"} Error {/if}
</h1>

{#if $routerStore.loadingStatus === -1}
<div>error {$routerStore.error}</div>
{/if}
```

## Protected routes

to use a protected route you set authenticator to a function that either returns a boolean
or a promise that returns a boolean

the router will display the protected component only if:

- authenticator returned a truthy value
- authenticator returned a promise that returned a truthy value

otherwise authentication failed and it will hide the component

example:

```js
[
  ...
  {
    path: "/protected",
    // or protected with params
    path: "/protected/:id"
    authenticator: () => {
      // some authentication logic...
      return true;
    },
    // or
    authenticator: async () => {
      // some authentication logic...
      return true;
    },
    component: Protected
  }
  ...
]
```

### authRedirect

authRedirect is an option to redirect the user to a different route (/login for example) if authentication fails

example

```js
[
  ...{
    path: "/login",
    component: Login,
  },
  {
    path: "/user-info",
    component: UserInfo,
    authenticator: () => {
      /* some authentication logic... */
    },
    // redirects the user to "/login" if he is not logged in
    authRedirect: "/login",
  },
];
```

### authComponent

authComponent is an an option to display a component if authentication failed or pending

if you want to set a default authComponent see [defaultAuthComponent](#defaultauthcomponent)

the router will pass the following props:

- authStatus
  a string that represents the status of authentication
  if `pending` authenticator returned a promise and it's pending
  if `fail` authentication failed
  if `error` authenticator returned a promise and it reject
- error (optional)
  represents an error if authenticator returned a promise and it reject
- params
  Auth component have access to params

example

```html
<script>
  import { routerStore } from "super-svelte-router";
</script>

<h1>
  {#if $routerStore.authStatus === "pending"} Checking if you authenticated
  {:else if $routerStore.authStatus === "fail"} Sorry, you are NOT authenticated
  {:else if $routerStore.authStatus === "error"} Sorry, Unknown error happened
  {/if}
</h1>
```

## Metadata

metadata is an object that contains some metadata for the router

```js
[
  {
    metadata: true,
    defaultLoading: loading,
    defaultAuthComponent: Auth,
  },
];
```

### defaultLoading

if [loading](#loading) is not set the routes will use it as a replacement

### defaultAuthComponent

if [authComponent](#authcomponent) is not set will use it as a replacement

## Component

if you want to have a component being in App.svelte instead of having a hole file for it use `Component`

`Component` takes a prop called `name` to identify it

to use a `Component` set `component` to the `Component`'s name

you could also set [authComponent](#authcomponent) and [loading](#loading) to the `Component`'s name

you could access every thing on [routerStore](#routerstore) via slot props

example:

```html
<script>
  import { Router, Component } from "super-svelte-router";

  const routes = [
    {
      path: "/",
      component: "main",
    },
    {
      path: "/article/:id",
      component: "article",
    },
  ];
</script>

<Router {routes}>
  <Component name="main">
    <h1>This is the main page</h1>
  </Component>
  <Component name="article" let:params>
    <h1>This is article {params.id}</h1>
  </Component>
</Router>
```

## isActive

if you want to check if a route is use `isActive`

`isActive` is a derived store the it's value is the function

that you pass the pathname of route you want to check if it's active

example:

```html
<script>
  import { isActive } from "super-svelte-router";
</script>

<h1 class:red={$isActive("/")}>I'm Red if route is /</h1>

<style>
  .red { color: red }
</style>
```

## redirect

use [routerStore.redirect](#redirect-method) instead

redirect is function to redirect programmatically

NOTE: do not use full urls this function only works with pathname(s)

```js
import { redirect } from "super-svelte-router";

redirect("/endpoint");
// replace instead of push
redirect("/endpoint", true);
```

## link

link is an action for redirecting

```html
<script>
  import { link } from "super-svelte-router";
</script>

<a href="/hello" use:link>/hello</a>

<!-- or (not recommended) -->

<a use:link="/hello">/hello</a>
```

## linkHandler

use [link](#link) instead

linkHandler is a function that handles clicking on a link (a tag)

```html
<script>
  import { linkHandler } from "super-svelte-router";

  function handler(e) {
    linkHandler(e);
    // your code...
  }
</script>

<!-- if what you is only redirecting -->
<a href="/hello" on:click="{linkHandler}">/hello</a>
<!-- or -->
<a href="/hello" on:click="{handler}">/hello</a>
```

# Setting up rollup for code splitting

you should set up code splitting if will use lazy loading

in rollup.config.js

```js
export default {
  ...
  output: {
    sourcemap: true,
    // change format from iffe to es
    format: "es",
    name: "app",
    dir: "public/build",
  },
  ...
}
```

in public/index.html

```html
<html>
  <head>
    ...
    <!-- add type="module" to script tag -->
    <script src="build/main.js" type="module"></script>
    ...
  </head>
  ...
</html>
```
