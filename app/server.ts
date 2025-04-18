import { setDefaultResultOrder } from "node:dns";

import { createOpenAI } from "@ai-sdk/openai";
import { streamText, ChatRequest } from "ai";
import parser from "body-parser";
import express from "express";

import reactRouter from "virtual:react-router/express";

setDefaultResultOrder("ipv4first");

const app = express();
app.use(express.static("public"));

app.post("/api/chat", parser.json({ strict: false }), (req, res) => {
  const { messages } = req.body as ChatRequest;

  const result = streamText({
    model: createOpenAI({
      baseURL: "http://localhost:11434/v1",
    })("llama3.2"),
    system: "You are a helpful assistant.",
    messages,
  });

  result.pipeDataStreamToResponse(res);
});

app.use(reactRouter);

app.listen(3000);
console.log("Server listening on port 3000 (http://localhost:3000)");
