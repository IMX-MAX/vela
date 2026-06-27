require('dotenv').config({ path: '.env.local' });
const { Mistral } = require('@mistralai/mistralai');

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function test() {
  try {
    const messages = [
      { role: 'user', content: 'test search_inbox tool with query "hello"' }
    ];

    const response = await mistral.chat.complete({
      model: "mistral-medium-latest",
      messages: messages,
      tools: [{
        type: "function",
        function: {
          name: "search_inbox",
          description: "Search",
          parameters: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"]
          }
        }
      }],
      toolChoice: "auto"
    });
    
    const choice = response.choices[0].message;
    messages.push(choice);
    
    messages.push({
      role: 'tool',
      name: 'search_inbox',
      content: 'tool result',
      toolCallId: choice.toolCalls[0].id
    });
    
    console.log("SENDING MESSAGES:", JSON.stringify(messages, null, 2));

    const response2 = await mistral.chat.complete({
      model: "mistral-medium-latest",
      messages: messages
    });
    console.log("SUCCESS!");
    console.log(response2.choices[0].message);
  } catch (err) {
    console.error("ERROR:");
    console.error(err.message);
  }
}

test();
