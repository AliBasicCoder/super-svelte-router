// this is just an empty file that will be overwritten by super-svelte-route's rollup plugin
// it will convert routes defined in super-svelte-router.json into JS (as examples blow)
// rollup and svelte will do that job of transforming that into JS (the final bundle)

// the result will be something like this if compiling for SSR

// import App from "./src/App.svelte";
// import File1111 from "./src/Layout.svelte";
// import File5424 from "./src/About.svelte"
// import File2323 from "./src/Index.svelte";
//
// const routes = [
//   { layout: 2, component: File1111 },
//   { path: "/about", component: File5424 },
//   { path: "/", component: File2323 },
// ];
//
// export { routes, App }

// and like this if compiling for the browser

// import App from "./src/App.svelte";
// import File1111 from "./src/Layout.svelte";
//
// const routes = [
//   { layout: 2, component: File1111 },
//   { path: "/about", lazyLoad: { component: () => import("./src/About.svelte") } },
//   { path: "/", lazyLoad: { component: () => import("./src/Index.svelte") } },
// ];
//
// new App({ target: document.body, props: { routes, initialPathname: window.location.pathname }, hydrate: true });
