import React from "react";
import StoryGenerator from "./StoryComponent";
import PaintApp from "./PaintComponent";


function PaintAndStory() {
    const getCanvasImage = () => {
      const canvas = document.querySelector('canvas');
      return canvas.toDataURL("image/png").split(',')[1];
    };
  
    return (
      <div className="bg-[#6488EA]">
        <div className="flex ml-8 py-8">
          <a href="/Home" className="flex mt-3 items-center justify-center w-10 h-10 border-1 border-black rounded-full text-black hover:bg-blue-100 transition">
            ←
          </a>
          <h1 className="bg-gradient-to-r from-blue-100 via-white to-blue-400 bg-clip-text text-transparent ml-7 text-6xl font-extrabold">Sketch Tales</h1>
        </div>
        <div className="flex flex-row items-center justify-center mt-[-10vh] min-h-screen p-6 space-y-6">

          <PaintApp getCanvasImage={getCanvasImage} />
          
          <StoryGenerator getCanvasImage={getCanvasImage} />
        </div>
      </div>
    );
  }
  
  export default PaintAndStory;