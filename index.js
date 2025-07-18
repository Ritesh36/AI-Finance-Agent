import Groq from "groq-sdk";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const expenseDB = [];

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const messages = [
  {
    role: "system",
    content: `You are Jarvis, a personal finance assistant. Your task is to assist user with their expenses, balances and financial planning.
            You have access to following tools:
            1. getTotalExpense({from, to}): string // Get total expense for a time period.
            2. addExpense({name, amount}): string // Add new expense to the expense database.
            
            current datetime: ${new Date().toUTCString()}`
  },
];

// messages.push({
//   role: "user",
//   content:
//     "Hey Jarvis, How much have I spent this month?",
// });

async function main() {

  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

  //this is for user
  while (true) {


    const question = rl.question(`User: `);

    messages.push({
      role: "user",
      content: question,
    });

    if(question == "bye" || question == "exit" || question == "quit") {
      break;
    };

    //this is for agent
    while (true) {
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        tools: [
          {
            type: "function",
            function: {
              name: "getTotalExpense",
              description: "Get the total expenses for the month",
              parameters: {
                type: "object",
                properties: {
                  from: {
                    type: "string",
                    description:
                      "The start date for the expense report (YYYY-MM-DD)",
                  },
                  to: {
                    type: "string",
                    description:
                      "The end date for the expense report (YYYY-MM-DD)",
                  },
                },
              },
            },
          },
          {
            type: "function",
            function: {
              name: "addExpense",
              description: "Add a new expense to the expense database",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description:
                      "The name of the expense e.g., Bought an iphone ",
                  },
                  amount: {
                    type: "number",
                    description: "The amount of the expense e.g., 10000INR",
                  },
                },
              },
            },
          },
        ],
      });

      // console.log(JSON.stringify(completion.choices[0], null, 2));
      messages.push(completion.choices[0].message);

      const toolCalls = completion.choices[0].message.tool_calls;
      if (!toolCalls) {
        console.log(`Assitant : ${completion.choices[0].message.content}`);
        return;
      }

      for (const tool of toolCalls) {
        const functionName = tool.function.name;
        const functionArgs = JSON.parse(tool.function.arguments);

        let result = "";

        if (functionName === "getTotalExpense") {
          result = getTotalExpense(functionArgs);
        } else if (functionName === "addExpense") {
          result = addExpense(functionArgs);
        }

        messages.push({
          role: "tool",
          content: result,
          tool_call_id: tool.id,
        });

      }
    }
  }
}

console.log("===============");
console.log("MESSAGES:", messages);
console.log("===============");
console.log(`DB: `, expenseDB);

main();

function getTotalExpense({ from, to }) {
    // console.log('Calling getTotalExpense tool');

    // In reality -> we call db here...
    const expense = expenseDB.reduce((acc, item) => {
        return acc + item.amount;
    }, 0);
    return `${expense} INR`;
}

function addExpense({ name, amount }) {
  console.log(`Adding expense: ${amount} for ${name}`);
  expenseDB.push({ name, amount });
  return "Expense added successfully";
}
