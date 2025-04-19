import * as fsp from "node:fs/promises";
import * as path from "node:path";

import mod from "./dist/server/server.js";

/** @type {import("node:http").Server} */
const server = mod.default;

const toPrerender = ["/"];

server.once("listening", async () => {
  const address = server.address();
  if (typeof address !== "object") throw new Error("address is not an object");
  const baseURL = `http://127.0.0.1:${address.port}/`;

  try {
    await fsp.rm(OUTDIR, { recursive: true }).catch((err) => {
      if (err?.code === "ENOENT") return;
      throw err;
    });
    for (const pathname of toPrerender) {
      const htmlURL = new URL(pathname, baseURL);
      const manifestURL = new URL(htmlURL.pathname + ".manifest", baseURL);

      const [htmlResponse, manifestResponse] = await Promise.all([
        fetch(htmlURL),
        htmlURL.pathname.length > 1 ? fetch(manifestURL) : null,
      ]);
      if (
        !htmlResponse.status === 200 ||
        (manifestResponse && manifestResponse.status !== 200)
      ) {
        throw new Error(
          `Failed to fetch ${pathname} (${htmlResponse.status}): ${htmlResponse.statusText}`
        );
      }
      const contentType = htmlResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("text/html")) {
        throw new Error("Response was not HTML");
      }
      const [html, manifest] = await Promise.all([
        htmlResponse.text(),
        manifestResponse?.text(),
      ]);
      const inlineScripts = html.matchAll(
        /<script\b[^>]*>([\s\S]*?)<\/script>/gi
      );
      let rscPayload = "";
      for (const [script] of inlineScripts) {
        if (script.startsWith(PREFIX) && script.endsWith(SUFFIX)) {
          rscPayload += JSON.parse(
            `"${script.slice(PREFIX.length, -SUFFIX.length)}"`
          );
        }
      }

      const rscURL = singleFetchUrl(new URL(htmlURL), undefined, "rsc");

      await fsp.mkdir(path.join(OUTDIR, htmlURL.pathname.slice(1) || "."), {
        recursive: true,
      });

      const htmlFile = path.resolve(
        OUTDIR,
        path.join(htmlURL.pathname.slice(1) || ".", "index.html")
      );
      const rscFile = path.resolve(OUTDIR, rscURL.pathname.slice(1));
      const manifestFile = path.resolve(OUTDIR, manifestURL.pathname.slice(1));

      await Promise.all([
        fsp.writeFile(htmlFile, html),
        fsp.writeFile(rscFile, rscPayload),
        manifest ? fsp.writeFile(manifestFile, manifest) : null,
      ]);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
});

const PREFIX = `<script>(self.__FLIGHT_DATA||=[]).push("`;
const SUFFIX = `")</script>`;
const OUTDIR = path.resolve("./prerendered");

function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;

  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }

  // We want to leave trailing slash behavior in the user's control, so if they
  // specify a basename with a trailing slash, we should support it
  let startIndex = basename.endsWith("/")
    ? basename.length - 1
    : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    // pathname does not start with basename/
    return null;
  }

  return pathname.slice(startIndex) || "/";
}

function singleFetchUrl(reqUrl, basename, extension) {
  let url =
    typeof reqUrl === "string"
      ? new URL(
          reqUrl,
          // This can be called during the SSR flow via PrefetchPageLinksImpl so
          // don't assume window is available
          typeof window === "undefined"
            ? "server://singlefetch/"
            : window.location.origin
        )
      : reqUrl;

  if (url.pathname === "/") {
    url.pathname = `_root.${extension}`;
  } else if (basename && stripBasename(url.pathname, basename) === "/") {
    url.pathname = `${basename.replace(/\/$/, "")}/_root.${extension}`;
  } else {
    url.pathname = `${url.pathname.replace(/\/$/, "")}.${extension}`;
  }

  return url;
}
