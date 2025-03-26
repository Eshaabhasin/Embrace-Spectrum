import React, { useState, useRef } from "react";
import axios from "axios";

function PaintAndStory() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState("brush");
  const [shape, setShape] = useState(null);
  const [startPos, setStartPos] = useState(null);
  const [prompt, setPrompt] = useState("");  // Displayed in textarea
  const [internalPrompt, setInternalPrompt] = useState("");  // Used internally for AI request
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Start Drawing
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    const pos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    setStartPos(pos);
    setDrawing(true);

    if (mode === "brush" || mode === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  // Draw Function
  const draw = (e) => {
    if (!drawing) return;
    const ctx = ctxRef.current;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (mode === "brush") {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (mode === "eraser") {
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  // Stop Drawing
  const stopDrawing = () => {
    setDrawing(false);
  };

  // Clear Canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Get Image Data from Canvas
  const getCanvasImage = () => {
    const canvas = canvasRef.current;
    return canvas.toDataURL();
  };

  // Prepare Internal Prompt (Not Visible)
  const sendDrawingToPrompt = () => {
    const imageBase64 = getCanvasImage();
    setInternalPrompt(`Write a simple, engaging, and autism-friendly story based on this prompt: ${prompt}. 
       Also, consider this image input while writing the story: ${imageBase64}.
       The story should be easy to read and visualize.`);
  };

  // Generate AI Story
  const generateStory = async () => {
    if (!internalPrompt.trim()) return;

    setLoading(true);
    setStory("");
    setError("");

    try {
      const response = await axios.post("http://localhost:5001/generate-story", {
        prompt: internalPrompt,  // Use internal prompt instead of user-visible prompt
      });

      if (response.data && response.data.story) {
        setStory(response.data.story);
      } else {
        throw new Error("Unexpected response structure from API.");
      }
    } catch (error) {
      console.error("Error generating story:", error.response?.data || error.message);
      setError("Failed to generate a story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 space-y-6">
      {/* Paint App */}
      <div className="flex w-full max-w-5xl">
        {/* Sidebar */}
        <div className="w-64 bg-[#5C7EEC] text-white p-4 flex flex-col space-y-3">
          <h1 className="text-xl font-bold">🎨 Paint App</h1>

          {/* Tools */}
          <div>
            <h2 className="font-semibold mb-1">Tools</h2>
            <button className={`w-full p-2 rounded ${mode === "brush" ? "bg-gray-600" : ""}`} onClick={() => setMode("brush")}>🖌️ Brush</button>
            <button className={`w-full p-2 rounded ${mode === "eraser" ? "bg-gray-600" : ""}`} onClick={() => setMode("eraser")}>🧽 Eraser</button>
          </div>

          {/* Colors */}
          <div>
            <h2 className="font-semibold mb-1">Brush Color</h2>
            <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-full h-8" />
          </div>

          {/* Actions */}
          <button onClick={clearCanvas} className="w-full bg-red-500 p-2 rounded">🗑️ Clear</button>
          <button onClick={sendDrawingToPrompt} className="w-full bg-yellow-500 text-black p-2 rounded mt-2">🎨 Use Drawing for Story</button>
        </div>

        {/* Canvas */}
        <canvas ref={canvasRef} width={800} height={500} className="border border-gray-700 bg-white flex-1" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing}></canvas>
      </div>

      {/* Story Generator */}
      <div className="w-full max-w-5xl bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold">📖 AI Story Generator</h2>
        <textarea className="w-full p-3 border rounded-md" placeholder="Enter a story prompt..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button className="w-full bg-blue-600 text-white p-2 rounded mt-3" onClick={generateStory}>{loading ? "Generating..." : "Generate Story"}</button>
        {story && <p className="mt-3">{story}</p>}
      </div>
    </div>
  );
}

export default PaintAndStory;
