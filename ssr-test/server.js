const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

app.use("/build", express.static(path.join(process.cwd(), "build")));

app.use((req, res, next) => {
  const { App, routes } = require("./build/ssr");
  const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");

  const result = App.render({ routes, initialPathname: req.path });
  res.send(html.replace("%body%", result.html));
});

app.listen(3000);
