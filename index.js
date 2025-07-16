#!/usr/bin/env node

import OpenAI from "openai";

const KEY = process.env.OPEN_AI_KEY;
if (!KEY) {
  console.error("OPEN_AI_KEY env variable not found");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: KEY,
});

let userInput = "";

process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => (userInput += chunk));
process.stdin.on("end", runPrompt);

async function runPrompt() {
  try {
    const stream = await client.chat.completions.create({
      model: "gpt-4.1",
      stream: true,
      messages: [{ role: "user", content: userInput }],
    });

    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
