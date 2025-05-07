import { provide, pull } from "@ryanflorence/async-provider";
import { Link, Outlet, unstable_MiddlewareFunction } from "react-router";

import { stringContext } from "./context";
import "./styles.css";

export const unstable_middleware: unstable_MiddlewareFunction<Response>[] = [
  async ({}, next) => {
    let res = await provide(new Map([[stringContext, "Hello World!"]]), next);
    res.headers.set("X-Custom-Header", "Value");
    return res;
  },
];

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

export function ServerComponent() {
  return (
    <div id="root">
      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  return <h1>Oooops</h1>;
}
