import { useChat } from "@ai-sdk/react";
import { useActionState, useState } from "react";

import { streamComponent } from "./ai.actions.tsx";

export default function Page() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    error,
    reload,
  } = useChat({});

  const [component, streamComponentAction, pending] = useActionState(
    streamComponent,
    null
  );

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.content}
        </div>
      ))}

      {(status === "submitted" || status === "streaming") && (
        <div>
          {status === "submitted" && "AI is thinking..."}
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => reload()}>
            Retry
          </button>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">Submit</button>
      </form>

      <hr />

      <form action={streamComponentAction}>
        <button type="submit">Stream Component Through Server Action</button>
      </form>
      {pending && <div>Loading...</div>}
      {component}
    </>
  );
}
