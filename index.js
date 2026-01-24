#!/usr/bin/env node

import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

async function main() {
    const args = process.argv.slice(2);
    const model = args[0];

    switch (model) {
        case "gemini": {
            geminiReq();
            break;
        }
        case "openai": {
            openAIReq();
            break;
        }
        case "--help": {
            process.stdout.write(
                "Commands:\n  gemini (for gemini 3 flash preview)\n  openai (for gpt 4.1)\n  --help\n",
            );
            break;
        }
        default: {
            await wait(0.1);
            process.stdout.write("Invalid model\n");
        }
    }
}
main();

function getStdin(cb) {
    let input = "";

    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (input += chunk));
    process.stdin.on("end", () => cb(input));
}

function geminiReq() {
    const ai = new GoogleGenAI({});

    getStdin(runPrompt);

    async function runPrompt(input) {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: input,
        });
        process.stdout.write(response.text);
    }
}

function openAIReq() {
    const KEY = process.env.OPEN_AI_KEY;
    if (!KEY) {
        console.error("OPEN_AI_KEY env variable not found");
        process.exit(1);
    }

    const client = new OpenAI({
        apiKey: KEY,
    });

    getStdin(runPrompt);

    async function runPrompt(input) {
        try {
            const stream = await client.chat.completions.create({
                model: "gpt-4.1",
                stream: true,
                messages: [{ role: "user", content: input }],
            });

            for await (const chunk of stream) {
                process.stdout.write(chunk.choices[0]?.delta?.content || "");
            }
        } catch (err) {
            console.error("Error:", err.message);
        }
    }
}

function wait(sec) {
    return new Promise((res) => {
        setTimeout(() => {
            res();
        }, sec * 1000);
    });
}
