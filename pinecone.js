export default async function main(args) {
  // Extract input variables from args
  const { userMessage, assistantName, pineconeApiKey } = args.inputVars;
  var { conversationHistory } = args.inputVars;

  // Validate that the required input variables are provided
  if (!userMessage || !assistantName || !pineconeApiKey) {
    return {
      next: { path: 'error' },
      trace: [{ type: "debug", payload: { message: "Missing required input variables for this function" } }]
    };
  }

  // Parse conversationHistory if it's a JSON string
  if (typeof conversationHistory === 'string') {
    try {
      conversationHistory = JSON.parse(conversationHistory);
    } catch (error) {
      console.error("Error parsing conversation history:", error);
      conversationHistory = []; // Reset to empty array if parsing fails
    }
  }

  // Initialize conversationHistory as an empty array if it's not defined or empty
  if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
    conversationHistory = [];
  }

  // Add user message to conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  // Define the URL for the Pinecone API call
  const url = `https://prod-1-data.ke.pinecone.io/assistant/chat/${assistantName}/chat/completions`;

  // Configure the fetch request
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': `${pineconeApiKey}`
    },
    body: JSON.stringify({
      messages: conversationHistory
    })
  };

  try {
    // Make the API call
    const response = await fetch(url, config);

    // Check if the response status is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Extract the JSON body from the response
    const responseBody = await response.json;

    // Validate the responseBody structure as expected
    if (!responseBody || typeof responseBody !== 'object' || !responseBody.choices || !responseBody.choices[0] || !responseBody.choices[0].message) {
      throw new Error("Invalid or missing response body from the API");
    }

    // Extract the assistant's message from the response
    const assistantMessage = responseBody.choices[0].message.content;

    // Add assistant's message to conversation history
    conversationHistory.push({ role: "assistant", content: assistantMessage });

    // Create the success return object with extracted data
    return {
      outputVars: { 
        conversationHistory: JSON.stringify(conversationHistory), 
        assistantMessage
      },
      next: { path: 'success' },
    };
  } catch (error) {
    return {
      next: { path: 'error' },
      trace: [{ type: "debug", payload: { message: "Error: " + error } }]
    };
  }
}
