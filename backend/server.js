import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = 5001;

// Initialize Gemini AI with API Key
const genAI = new GoogleGenerativeAI("AIzaSyBHBovnMnVte6fOiONYQB64svJ3R8WBNdw"); // Replace with a valid API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increased limit for handling images

// Function to clean up responses
const trimResponse = (message) => {
  return message ? message.trim() : "I couldn't generate a response.";
};

// 📌 **Chatbot Endpoint**
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

// 📌 **Story & Image Generation Endpoint**
app.post("/generate-story", async (req, res) => {
  const { prompt, image } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    // Include image data in the prompt if available
    const imageContext = image ? "This is the related image: " + image : "No image provided.";

    // Generate a simplified story
    const storyResult = await model.generateContent(
      `Write a simple, engaging, and autism-friendly story based on this prompt: ${prompt}. 
       Also, consider this image input while writing the story: ${imageContext}.
       The story should be easy to read and visualize.`
    );
    const storyResponse = await storyResult.response;
    const storyText =
      storyResponse.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a story.";

    // Generate an image illustration for the story
    const imageResult = await model.generateContent(
      `Generate a colorful, child-friendly image that visually represents this story: ${storyText}.`
    );
    const imageResponse = await imageResult.response;
    const imageUrl =
      imageResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.status(200).json({ story: trimResponse(storyText), image: imageUrl });
  } catch (error) {
    console.error("Error generating story or image:", error);
    return res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
      details: error.response?.data || "No additional details available.",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
