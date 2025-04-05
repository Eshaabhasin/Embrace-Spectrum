import React, { useState, useRef, useEffect } from "react";
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
  const [prompt, setPrompt] = useState("");  // Text prompt
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [includeDrawing, setIncludeDrawing] = useState(true);

  // Initialize canvas on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Fill canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
  }, []);

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
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Get Image Data from Canvas
  const getCanvasImage = () => {
    const canvas = canvasRef.current;
    // Return base64 data without the data:image/png;base64, prefix
    return canvas.toDataURL("image/png").split(',')[1];
  };

  // Generate AI Story
  const generateStory = async () => {
    if (!prompt.trim()) {
      setError("Please enter a story prompt.");
      return;
    }

    setLoading(true);
    setStory("");
    setError("");

    try {
      const requestData = {
        prompt: prompt
      };
      
      // Only include image data if the checkbox is checked
      if (includeDrawing) {
        requestData.imageBase64 = getCanvasImage();
        requestData.includeDrawing = true;
      }

      const response = await axios.post("http://localhost:5001/generate-story", requestData);

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
    <div className="bg-[#5C7EEC]">
    <div className="flex ml-8 py-8">
    <a href="/Home" className="flex mt-3 items-center justify-center w-10 h-10 border-1 border-black rounded-full text-black hover:bg-blue-100 transition">
          ←
    </a>
    <h1 className="bg-gradient-to-r from-blue-100 via-white to-blue-400 bg-clip-text text-transparent ml-7 text-6xl font-extrabold">Sketch Tales</h1>
    </div>
    <div className="flex flex-row items-center justify-center min-h-scree p-6 space-y-6">
      {/* Paint App */}
      <div className="flex w-full">
        {/* Sidebar */}
        <div className="w-44 bg-[#25419e] text-white p-4 flex flex-col space-y-3 rounded-2xl">
          <h2 className="text-xl font-bold">Paint Tools</h2>

          {/* Tools */}
          <div>
            <h3 className="font-semibold mb-1">Tools</h3>
            <button 
              className={`w-full p-2 rounded ${mode === "brush" ? "bg-gray-600" : ""}`} 
              onClick={() => setMode("brush")}
            >
              🖌️ Brush
            </button>
            <button 
              className={`w-full p-2 rounded ${mode === "eraser" ? "bg-gray-600" : ""}`} 
              onClick={() => setMode("eraser")}
            >
              🧽 Eraser
            </button>
          </div>

          {/* Colors */}
          <div>
            <h3 className="font-semibold mb-1">Brush Color</h3>
            <input 
              type="color" 
              value={brushColor} 
              onChange={(e) => setBrushColor(e.target.value)} 
              className="w-full h-8"
            />
          </div>

          {/* Brush Size */}
          <div>
            <h3 className="font-semibold mb-1">Brush Size: {brushSize}</h3>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))} 
              className="w-full"
            />
          </div>

          {/* Actions */}
          <button 
            onClick={clearCanvas} 
            className="w-full bg-red-500 p-2 rounded hover:bg-red-600 transition"
          >
            🗑️ Clear Drawing
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-200 ml-5 flex items-center rounded-2xl justify-center">
          <canvas 
            ref={canvasRef} 
            width={550} 
            height={480} 
            className="border border-gray-700 rounded-2xl bg-white" 
            onMouseDown={startDrawing} 
            onMouseMove={draw} 
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>

      {/* Story Generator */}
      <div className="w-full max-w-4xl h-[70vh] ml-5 p-3 rounded-lg">
        <h2 className="text-3xl font-bold mb-4 text-white">Generate your Imagination ✨</h2>
        
        <div className="mb-4">
          <label className="flex items-center space-x-2 mb-2 text-white">
            <input 
              type="checkbox" 
              checked={includeDrawing} 
              onChange={(e) => setIncludeDrawing(e.target.checked)}
              className="h-5 w-5"
            />
            <span>Include my drawing in the story generation</span>
          </label>
          
          <textarea 
            className="w-full p-3 border rounded-md h-32 bg-white/70 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400" 
            placeholder="Enter a story prompt... (e.g., 'Write a children's story about what I drew')" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
          />
        </div>
        
        <button 
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition text-lg font-medium disabled:bg-blue-300" 
          onClick={generateStory}
          disabled={loading}
        >
          {loading ? "Generating Story..." : "Generate Story"}
        </button>
        
        {error && <p className="mt-3 text-red-300">{error}</p>}
        
        {story && (
          <div className="mt-6 p-4 border rounded-md bg-white/70 text-black">
            <h3 className="text-xl font-semibold mb-2">Your Story:</h3>
            <div className="prose max-w-none">
              {story.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default PaintAndStory;