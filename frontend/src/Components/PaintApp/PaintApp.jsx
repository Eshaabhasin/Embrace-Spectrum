import React, { useRef, useState } from "react";

const PaintApp = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState("brush");
  const [shape, setShape] = useState(null);
  const [startPos, setStartPos] = useState(null);
  const [tempCanvas, setTempCanvas] = useState(null);

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
    } else if (shape) {
      // Create a temporary canvas for shape preview
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      setTempCanvas(tempCanvas);
    }
  };

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
    } else if (shape) {
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.fillStyle = fillColor;
      tempCtx.strokeStyle = brushColor;
      tempCtx.lineWidth = brushSize;

      const width = x - startPos.x;
      const height = y - startPos.y;

      if (shape === "rectangle") {
        tempCtx.fillRect(startPos.x, startPos.y, width, height);
        tempCtx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (shape === "circle") {
        tempCtx.beginPath();
        tempCtx.arc(startPos.x, startPos.y, Math.abs(width) / 2, 0, Math.PI * 2);
        tempCtx.fill();
        tempCtx.stroke();
      } else if (shape === "triangle") {
        tempCtx.beginPath();
        tempCtx.moveTo(startPos.x, startPos.y);
        tempCtx.lineTo(startPos.x + width, startPos.y);
        tempCtx.lineTo(startPos.x + width / 2, startPos.y - height);
        tempCtx.closePath();
        tempCtx.fill();
        tempCtx.stroke();
      }

      const mainCtx = canvasRef.current.getContext("2d");
      mainCtx.drawImage(tempCanvas, 0, 0);
    }
  };

  const stopDrawing = () => {
    setDrawing(false);
    setMode("brush"); // Reset to brush mode after drawing a shape
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-[#5C7EEC] text-white p-4 flex flex-col space-y-3">
        <h1 className="text-xl font-bold">🎨 Paint App</h1>

        {/* Tools */}
        <div>
          <h2 className="font-semibold mb-1">Tools</h2>
          <button className={`w-full p-2 rounded ${mode === "brush" ? "bg-gray-600" : ""}`} onClick={() => { setMode("brush"); setShape(null); }}>🖌️ Brush</button>
          <button className={`w-full p-2 rounded ${mode === "eraser" ? "bg-gray-600" : ""}`} onClick={() => { setMode("eraser"); setShape(null); }}>🧽 Eraser</button>
        </div>

        {/* Shapes */}
        <div>
          <h2 className="font-semibold mb-1">Shapes</h2>
          <button className={`w-full p-2 rounded ${shape === "rectangle" ? "bg-gray-600" : ""}`} onClick={() => { setShape("rectangle"); setMode(null); }}>▭ Rectangle</button>
          <button className={`w-full p-2 rounded ${shape === "circle" ? "bg-gray-600" : ""}`} onClick={() => { setShape("circle"); setMode(null); }}>⚫ Circle</button>
          <button className={`w-full p-2 rounded ${shape === "triangle" ? "bg-gray-600" : ""}`} onClick={() => { setShape("triangle"); setMode(null); }}>🔺 Triangle</button>
        </div>

        {/* Colors */}
        <div>
          <h2 className="font-semibold mb-1">Colors</h2>
          <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-full h-8" />
          <h2 className="font-semibold mt-2">Fill Color</h2>
          <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-full h-8" />
        </div>

        {/* Brush Size */}
        <div>
          <h2 className="font-semibold mb-1">Brush Size</h2>
          <input type="range" min="2" max="20" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} className="w-full" />
        </div>

        {/* Actions */}
        <div>
          <button onClick={clearCanvas} className="w-full bg-red-500 p-2 rounded">🗑️ Clear</button>
          <button onClick={saveCanvas} className="w-full bg-green-500 p-2 rounded mt-2">💾 Save</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-gray-300">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="border border-gray-700 bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        ></canvas>
      </div>
    </div>
  );
};

export default PaintApp;
