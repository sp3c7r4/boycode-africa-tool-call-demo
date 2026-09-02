import { createInterface } from "readline/promises";

const rl = createInterface({
  input: process.stdin
})

const input = await rl.question("Hi")
console.log(input)
