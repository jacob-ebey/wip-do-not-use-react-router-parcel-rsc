import type { LoaderFunctionArgs } from "react-router";

export async function loader({}: LoaderFunctionArgs) {
  return { message: "Server First", type: "server" };
}

async function otherAsyncData(type: string) {
  return `This is the ${type} first page.`;
}

export default async function ServerFirst({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>;
}) {
  const otherData = await otherAsyncData(loaderData.type);

  return (
    <div>
      <h1>{loaderData.message}</h1>
      <p>{otherData}</p>
    </div>
  );
}
