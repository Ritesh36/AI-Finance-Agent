import Groq from "groq-sdk";
import dotenv from "dotenv";
import e from "express";
dotenv.config();

const expenseDB = [];

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const messages = [
  {
    role: "system",
    content: `Your name is Jarvis, a helpful AI financial assistant. 
          You keep track of user expenses and provide insights on spending habits. 
          Current datetime: ${new Date().toUTCString()}.`,
  },
];

messages.push({
  role: "user",
  content:
    "Hi Jarvis, I want to track my expenses for this month. Please help me with that.",
});

async function main() {
  //this is for user
  while (true) {
    //this is for agent
    while (true) {
      const completion = await groq.chat.completions.create({
        messages: messages,
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

        if (functionName === "getTotalExpenses") {
          result = getTotalExpenses(functionArgs);
        } else if (functionName === "addExpense") {
          result = addExpense(functionArgs);
        }

        messages.push({
          role: "tool",
          content: result,
          tool_call_id: tool.id,
        });
      }

      // console.log(JSON.stringify(completion2.choices[0], null, 2));
    }
  }
}

console.log("===============");
console.log("MESSAGES:", messages);
console.log("===============");
console.log(`DB: `, expenseDB);

main();

function getTotalExpenses({ from, to }) {
  console.log("Calculating total expenses...");
  const expense = expenseDB.reduce((total, expense) => {
    return total + parseFloat(expense.amount);
  }, 0);
  return `${expense}INR`;
}

function addExpense({ name, amount }) {
  console.log(`Adding expense: ${amount} for ${name}`);
  expenseDB.push({ name, amount });
  return "Expense added successfully";
}
