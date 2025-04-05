import React, { useState, useRef, useEffect } from "react";

function PaintApp({ getCanvasImage }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState("brush");
  const [startPos, setStartPos] = useState(null);

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

  return (
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
  );
}

export default PaintApp