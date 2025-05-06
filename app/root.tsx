import { provide, pull } from "@ryanflorence/async-provider";
import { Link, Outlet, unstable_MiddlewareFunction } from "react-router";

import "./styles.css";
import { stringContext } from "./context";

export const unstable_middleware: unstable_MiddlewareFunction<Response>[] = [
  async ({}, next) => {
    console.log("start root middleware");
    let res = await provide(new Map([[stringContext, "Yoooooooooo"]]), next);
    console.log("end root middleware");
    return res;
  },
];

export function loader() {
  return {
    message: pull(stringContext),
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>React Router Parcel</title>
      </head>
      <body>
        <header>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
            </ul>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

export function ServerComponent({
  loaderData,
}: {
  loaderData: ReturnType<typeof loader>;
}) {
  return (
    <div id="root">
      <h1>Root Loader Data: {loaderData.message}</h1>
      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  return <h1>Oooops</h1>;
}
