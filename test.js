import dotenv from "dotenv";
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config(); // Load environment variables from .env file if present

const app = express();
app.use(express.json());

// Access your API key as an environment variable
const apiKey = "AIzaSyB0zQgGm54XK_tCqi2z2vUxCuOHfFNq32E";

if (!apiKey) {
  throw new Error("Missing GENERATIVE_AI_API_KEY environment variable");
}

let genAI;

// async function initializeGenerativeAI() {
//   try {
//     genAI = new GoogleGenerativeAI(apiKey);
//     await genAI.initialize();
//     console.log("Generative AI initialized successfully");
//   } catch (error) {
//     console.error("Error initializing Generative AI:", error);
//     throw new Error("Failed to initialize Generative AI");
//   }
// }

// initializeGenerativeAI();
genAI = new GoogleGenerativeAI(apiKey);
async function generateResponse(message, history) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 100,
    },
  });
  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
}

app.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;
    const history = [
      { role: "user", parts: [{ text: "Hello, I have 2 dogs in my house." }] },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ];

    const responseText = await generateResponse(message, history);
    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
