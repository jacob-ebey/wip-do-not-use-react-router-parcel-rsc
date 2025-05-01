import * as React from "react";
import { callServer } from "./entry.rsc.ts" assert { env: "react-server" };
import { createRequestListener } from "@mjackson/node-fetch-server";
import express from "express";
// @ts-expect-error - no types
import { renderToReadableStream as renderHTMLToReadableStream } from "react-dom/server.edge" assert { env: "react-client" };
import {
  routeRSCServerRequest,
  RSCStaticRouter,
} from "react-router" assert { env: "react-client" };
// @ts-expect-error
import { createFromReadableStream } from "react-server-dom-parcel/client.edge" assert { env: "react-client" };

const app = express();

app.use("/client", express.static("dist/client"));

app.use(
  createRequestListener(async (request) => {
    return routeRSCServerRequest(
      request,
      callServer,
      createFromReadableStream,
      async (payload) => {
        return await renderHTMLToReadableStream(
          React.createElement(RSCStaticRouter, { payload }),
          {
            bootstrapScriptContent: (
              callServer as unknown as { bootstrapScript: string }
            ).bootstrapScript,
          }
        );
      }
    );
  })
);

export default app;
