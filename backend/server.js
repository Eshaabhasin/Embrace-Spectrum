import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = 5001;

// Gemini AI setup
const genAI = new GoogleGenerativeAI("AIzaSyBdEFLrPJ1pVPZzFJT5m-MOQQ9Y8vMKluU");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ✅ CORS middleware with allowed origin (your Vercel frontend)
app.use(cors({
  origin: "https://embrace-spectrum.vercel.app", // ⬅️ Allow your Vercel frontend
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));

// ✅ Health check route
app.get("/test", (req, res) => {
  res.status(200).send("✅ Backend is up and running!");
});

// ✅ Clean response helper
const trimResponse = (message) => {
  return message ? message.trim() : "I couldn't generate a response.";
};

// ✅ Chatbot endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const result = await model.generateContent(message);
    const response = await result.response;
    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm not sure how to respond.";

    return res.status(200).json({ reply: trimResponse(text) });
  } catch (error) {
    console.error("Error in chat request:", error);
    return res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
      details: error.response?.data || "No additional details available.",
    });
  }
});

// ✅ Generate story from drawing and prompt
app.post("/generate-story", async (req, res) => {
  const { prompt, imageBase64, includeDrawing = true } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    let generationParts = [];

    // Add prompt text
    generationParts.push({
      text: `Write a simple, engaging, and autism-friendly story based on this prompt: ${prompt}.
             The story should be easy to read and visualize.`
    });

    // Add drawing if provided
    if (includeDrawing && imageBase64) {
      generationParts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageBase64
        }
      });

      generationParts[0].text += " Use the drawing provided to inspire characters, settings, or plot elements in the story.";
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: generationParts }]
    });

    const response = result.response;
    const storyText = response.text() || "I couldn't generate a story.";

    return res.status(200).json({
      story: trimResponse(storyText),
      success: true
    });
  } catch (error) {
    console.error("Error generating story:", error);
    return res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
      details: error.toString(),
      success: false
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
