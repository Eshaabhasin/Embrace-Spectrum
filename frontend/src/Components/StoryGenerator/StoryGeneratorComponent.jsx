import React from "react";
import StoryGenerator from "./StoryComponent";
import PaintApp from "./PaintComponent";
import NavBar from '../NavBar/NavBar'


function PaintAndStory() {
    const getCanvasImage = () => {
      const canvas = document.querySelector('canvas');
      return canvas.toDataURL("image/png").split(',')[1];
    };

    return (
      <>
      <NavBar/>
      <div className="bg-[#6488EA]">
        <div className="flex py-8 mt-20">
          <h1 className="bg-gradient-to-r from-blue-100 via-white to-blue-200 bg-clip-text text-transparent ml-7 text-5xl font-extrabold">
            Sketch Tales 
          </h1>
        </div>
        <div className="flex flex-row items-center justify-center mt-[-15vh] min-h-screen p-6 space-y-6">

          <PaintApp getCanvasImage={getCanvasImage} />
          
          <StoryGenerator getCanvasImage={getCanvasImage} />
        </div>
      </div>
      </>
    );
  }
  
  export default PaintAndStory;