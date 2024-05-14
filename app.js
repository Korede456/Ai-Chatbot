import "dotenv/config"; // Assuming you have a .env file with PORT defined
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: ["http://localhost:8081"],
};
app.use(cors(corsOptions));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Let's define an empty conversation history object
let conversationHistory = [
  {
    role: "model",
    parts: [{ text: "Great to meet you. What would you like to know?" }],
  },
];

app.post("/ask", async (req, res) => {
  const { message } = req.body;

  conversationHistory.unshift({
    role: "user",
    parts: [{ text: message }],
  });

  try {
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        maxOutputTokens: 300,
      },
    });

    try {
      const result = await chat.sendMessageStream(message);
      const response = await result.response;
      const text = response.text();

      conversationHistory.unshift({
        role: "model",
        parts: [{ text }],
      });
      res.status(200).json({ response: text });
    } catch (sendMessageError) {
      console.error("Error sending message:", sendMessageError);
      res.status(500).json({ error: "Error processing request" }); // More specific if possible
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
