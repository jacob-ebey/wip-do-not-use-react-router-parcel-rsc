import { pull } from "@ryanflorence/async-provider";
import { Route } from "./+types/home";

import { log } from "./home.actions";
import { stringContext } from "../context";

export function loader({}: Route.LoaderArgs) {
  return pull(stringContext);
}

export function ServerComponent({ loaderData }: Route.ComponentProps) {
  return (
    <main>
      <h1>Home</h1>
      <p>This is the home page.</p>
      <p>loaderData: {loaderData}</p>
      <form action={log}>
        <button type="submit">Log on server</button>
      </form>
    </main>
  );
}
