import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

export async function main() {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "",
        },
      ],
      // Change model to compound-beta to use agentic tooling
      // model: "llama-3.3-70b-versatile",
      model: "llama-3.3-70b-versatile",
    });

    console.log(completion.choices[0]?.message?.content || "");
    // Print all tool calls
    // console.log(completion.choices[0]?.message?.executed_tools || "");
}

main();