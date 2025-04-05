import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = 5001;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyBHBovnMnVte6fOiONYQB64svJ3R8WBNdw"); // Replace with a valid API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // This model supports multimodal inputs

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for image data

// Test Route to Verify Hosting
app.get("/test", (req, res) => {
  res.status(200).send("✅ Backend is up and running!");
});

// Clean Response Helper
const trimResponse = (message) => {
  return message ? message.trim() : "I couldn't generate a response.";
};

// Chatbot Endpoint
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

// Generate Story from Paint App Drawing
app.post("/generate-story", async (req, res) => {
  const { prompt, imageBase64, includeDrawing = true } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    let generationParts = [];
    
    // Add text prompt
    generationParts.push({
      text: `Write a simple, engaging, and autism-friendly story based on this prompt: ${prompt}.
             The story should be easy to read and visualize.`
    });

    // Add image if provided and includedDrawing is true
    if (includeDrawing && imageBase64) {
      generationParts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageBase64
        }
      });
      
      // Modify the prompt to reference the drawing
      generationParts[0].text += " Use the drawing provided to inspire characters, settings, or plot elements in the story.";
    }

    // Generate the story using text and optional image
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