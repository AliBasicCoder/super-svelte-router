# super-svelte-router

a small, simple router for [svelte](https://github.com/sveltejs/svelte)

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

# API

the router will always pass a prop named param by default it's {}

## 404 route

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

## basic (aka static) route

DO NOT use : in static routes

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

## dynamic route

to use a dynamic route put : before the dynamic part(s) of url
for example

you could have as many dynamic parts as you like

`/foo/:id`

in this example `:id` could be replaced with anything including `:id` expect /

example for pathname(s) that matches this example

`/foo/100`
`/foo/random-id`
`/foo/:id`
`/foo/` <-- be careful with this one

the router will pass a prop to component named params

example

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
  export let params;
  console.log(params); // => { id: "100" }
</script>

<h1>id is {params.id}</h1>
```

## lazy route

to use a lazy route you set lazyLoad.component to a function that returns a dynamic import for component

you muse setup rollup first see _Setting up rollup for code splitting_ above

example

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

the router will pass the following props:

- loadingStatus
  represents the status of loading
  if 0 component is still loading
  if -1 loading failed
- error (optional)
  represents an error happened while loading component
- params
  Loading component have access to params

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
  export let loadingStatus;
  export let error;
</script>

<h1>
  {#if loadingStatus === 0} Loading... {:else if loadingStatus === -1} Error
  {/if}
</h1>
{#if loadingStatus === -1}
<div>error {error}</div>
{/if}
```

## protected route

to use a protected route you set authenticator to a function that either returns a boolean
or a promise that returns a boolean

the router will display the protected component only if (in other words authentication succeeded):

- authenticator returned a truthy value
- authenticator returned a promise that returned a truthy value

otherwise authentication failed and it will hide the component

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

### authComponent

the router will pass the following props:

- authStatus
  represents the status of authentication
  if it's 0 authenticator returned a promise and it's pending
  if it's -1 authentication failed
- error (optional)
  represents an error if authenticator returned a promise and it reject
- params
  Auth component have access to params

authComponent is an an option to display a component if authentication failed or pending

example

```html
<script>
  export let authStatus;
</script>

<h1>
  {#if authStatus === 0} Checking if you authenticated {:else if authStatus ===
  -1} Sorry, you are NOT authenticated {/if}
</h1>
```
