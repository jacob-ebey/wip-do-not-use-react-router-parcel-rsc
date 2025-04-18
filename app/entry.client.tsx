"use client-entry";

import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  createCallServer,
  getServerStream,
  ServerBrowserRouter,
} from "react-router";
import type { ServerPayload } from "react-router/server";
import {
  createFromReadableStream,
  encodeReply,
  setServerCallback,
  // @ts-expect-error
} from "react-server-dom-parcel/client";

const callServer = createCallServer({
  decode: (body) => createFromReadableStream(body, { callServer }),
  encodeAction: (args) => encodeReply(args),
});

setServerCallback(callServer);

createFromReadableStream(getServerStream(), { assets: "manifest" }).then(
  (payload: ServerPayload) => {
    startTransition(() => {
      hydrateRoot(
        document,
        <StrictMode>
          <ServerBrowserRouter
            decode={createFromReadableStream}
            payload={payload}
          />
        </StrictMode>
      );
    });
  }
);
