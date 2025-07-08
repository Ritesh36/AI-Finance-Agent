import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

export async function main() {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: 
          `Your name is Jarvis, a helpful AI financial assistant. 
          You keep track of user expenses and provide insights on spending habits. 
          Current datetime: ${new Date().toUTCString()}.`,
        },
        {
          role: "user",
          content: "Hi",
        },
      ],
      model: "llama-3.3-70b-versatile",
      tools: [
        {
          type: "function",
          function: {
            name: "getTotalExpenses",
            description: "Get the total expenses for the month",
            parameters: {
              type: "object",
              properties: {
                from : {
                  type: "string",
                  description: "The start date for the expense report (YYYY-MM-DD)",
                },
                to : {
                  type: "string",
                  description: "The end date for the expense report (YYYY-MM-DD)",
                },
              },
            }
          }
        }
      ],
    });

    console.log(JSON.stringify(completion.choices[0], null, 2));

    const toolCalls = completion.choices[0].message.tool_calls;
    if(!toolCalls) {
      console.log(`Assitant : ${completion.choices[0].message.content}`);
      return;
    }

    for(const tool of toolCalls){
      const functionName = tool.function.name;
      const functionArgs = JSON.parse(tool.function.arguments);

      if(functionName === "getTotalExpenses") {
        const expenses = getTotalExpenses(functionArgs);
      }
    }
}

main();

function getTotalExpenses({ from, to }) {
  console.log("Calculating total expenses...");
  return "500INR"; 
}
