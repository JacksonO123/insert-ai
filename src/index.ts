import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

export async function cli() {
    const args = process.argv.slice(2);
    const model = args[0];

    switch (model) {
        case "gemini": {
            const input = await getStdinOrError().catch((e) => {
                throw e;
            });
            geminiReq(input);
            break;
        }
        case "openai": {
            const input = await getStdinOrError().catch((e) => {
                throw e;
            });
            openAIReq(input);
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

async function getStdinOrError() {
    try {
        return await getStdin();
    } catch {
        throw new Error("Error reading stdin");
    }
}

function getStdin() {
    return new Promise<string>((resolve, reject) => {
        let input = "";

        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        process.stdin.on("data", (chunk) => {
            input += chunk;
        });

        process.stdin.on("end", () => {
            resolve(input);
        });

        process.stdin.on("error", (error) => {
            reject(error);
        });
    });
}

export async function geminiReq(prompt: string) {
    const ai = new GoogleGenAI({});

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });
    if (!response.text.endsWith("\n")) {
        process.stdout.write(response.text + "\n");
    }
}

export async function openAIReq(prompt: string) {
    const KEY = process.env.OPEN_AI_KEY;
    if (!KEY) {
        console.error("OPEN_AI_KEY env variable not found");
        process.exit(1);
    }

    const client = new OpenAI({
        apiKey: KEY,
    });

    try {
        const stream = await client.chat.completions.create({
            model: "gpt-4.1",
            stream: true,
            messages: [{ role: "user", content: prompt }],
        });

        let last = "";
        for await (const chunk of stream) {
            last = chunk.choices[0]?.delta?.content || "";
            process.stdout.write(last);
        }

        if (!last.endsWith("\n")) {
            process.stdout.write("\n");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

function wait(sec: number) {
    return new Promise<void>((res) => {
        setTimeout(() => {
            res();
        }, sec * 1000);
    });
}
