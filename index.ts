import { createDeepSeek } from "@ai-sdk/deepseek"
import { tool, ToolLoopAgent } from "ai"
import { config } from "@dotenvx/dotenvx";
import { createInterface } from "node:readline";
import { z } from "zod"

config({ path: ".env.development" })

/** @info - Types */
type Role = "user" | "assistant"

interface Message {
  role: Role,
  content: string
}

/** @info - Message store (conversation history) */
const messages: Message[] = []

/** @info - Initialize deepseek provider */
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY
})

const weatherAgent = new ToolLoopAgent({
  model: deepseek('deepseek-v4-pro'),
  instructions: "You're a weather agent",
  tools: {
    getWeather: tool({
      description: "This tool fetches weather for us",
      inputSchema: z.object({
        state: z.enum(["lagos", "abuja", "ogun"])
      }),
      execute: ({ state }) => {
        if (state === "lagos") {
          return "Rainy Days"
        } else if (state === "abuja") {
          return "Sunny"
        } else if (state === "ogun") {
          return "Winter"
        } else {
          return "No Weather data"
        }
      }
    })
  }
})

/** @info - Chat loop */
const rl = createInterface({ input: process.stdin, output: process.stdout })
rl.on("SIGINT", () => rl.close()) // Ctrl+C -> end loop

console.log('Weather agent ready. Ask anything — type "exit" to quit.\n')

for await (const line of rl) {
  const input = line.trim()
  if (!input) continue
  if (["exit", "quit", "bye"].includes(input.toLowerCase())) break

  messages.push({ role: "user", content: input })

  const result = await weatherAgent.generate({
    messages: [...messages]
  })

  const reply = result.text
  messages.push({ role: "assistant", content: reply })

  console.log(`AI: ${reply}\n`)
}

console.log("Goodbye!")
