// check_ai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Apni Key yaha daalo
const genAI = new GoogleGenerativeAI("AIzaSy...Teri_Key_Yaha_Paste_Kar");

async function checkModels() {
  try {
    // Available models ki list nikalo
    // Note: ListModels method ki jagah hum direct generate try karenge sabse popular models par

    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-pro",
      "gemini-1.5-pro-latest",
    ];

    console.log("🔍 Checking accessible models...\n");

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ SUCCESS: '${modelName}' is working!`);
        break; // Ek mil gaya toh ruk jao
      } catch (error) {
        console.log(
          `❌ FAILED: '${modelName}' - ${error.message.split("[")[0]}`
        );
      }
    }
  } catch (error) {
    console.error("Critical Error:", error);
  }
}

checkModels();
