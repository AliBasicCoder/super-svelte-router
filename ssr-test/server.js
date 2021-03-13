const { App, routes } = require("./build/ssr");
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");

app.use("/build", express.static(path.join(process.cwd(), "build")));

app.use((req, res, next) => {
  console.log(req.path);
  const result = App.render({ routes, initialPathname: req.path });
  res.send(
    html
      .replace("%body%", result.html)
      .replace("%style%", `<style>${result.css.code}</style>`)
  );
});

app.listen(3000);
