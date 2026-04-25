const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

async function main() {
  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash-latest",
      apiKey: "[GCP_API_KEY]",
      temperature: 0.3,
      maxOutputTokens: 1024,
    });

    const response = await llm.invoke([
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage("Hello!"),
    ]);

    console.log("Success:", response.content);
  } catch (err) {
    console.error("Error details:", err);
  }
}

main();
