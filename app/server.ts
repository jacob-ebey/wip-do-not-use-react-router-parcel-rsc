import express from "express";

import reactRouter from "virtual:react-router/express";

const app = express();
app.use(
  express.static("prerendered", {
    setHeaders(res, path) {
      if (path.endsWith(".rsc") || path.endsWith(".manifest")) {
        res.setHeader("Content-Type", "text/x-component");
      }
    },
  })
);
app.use(express.static("public"));
app.use(reactRouter);

export default app.listen(3000);
console.log("Server listening on port 3000 (http://localhost:3000)");
