const { App, routes } = require("./build/ssr");

console.log(routes, App);

console.log(App.render({ routes, initialPathname: "/about" }));
