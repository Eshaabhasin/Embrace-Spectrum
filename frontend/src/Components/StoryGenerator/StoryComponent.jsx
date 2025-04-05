import React, {useState} from "react";
import axios from "axios";

function StoryGenerator({ getCanvasImage }) {
    const [prompt, setPrompt] = useState("");
    const [story, setStory] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [includeDrawing, setIncludeDrawing] = useState(true);
    const [storyGenerated, setStoryGenerated] = useState(false);
  
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
        
        if (includeDrawing) {
          requestData.imageBase64 = getCanvasImage();
          requestData.includeDrawing = true;
        }
  
        const response = await axios.post("http://localhost:5001/generate-story", requestData);
  
        if (response.data && response.data.story) {
          setStory(response.data.story);
          setStoryGenerated(true);
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
  
    const resetStory = () => {
      setStoryGenerated(false);
      setStory("");
      setPrompt("");
    };
  
    return (
      <div className="w-full max-w-4xl h-[70vh] ml-5 p-3 rounded-lg">
        <h2 className="text-3xl font-bold mb-4 text-white">Generate your Imagination ✨</h2>
        
        {!storyGenerated ? (
          <>
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
            
            {loading && (
              <div className="mt-6 flex justify-center">
                <div className="loader w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-2 p-4 border rounded-md bg-white/70 text-black h-[calc(100%-70px)] flex flex-col">
            <h3 className="text-xl font-semibold mb-2">Your Story:</h3>
            <div className="prose max-w-none flex-grow overflow-y-auto">
              {story.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
            <button 
              className="mt-4 w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition text-lg font-medium"
              onClick={resetStory}
            >
              Generate Another Story
            </button>
          </div>
        )}
      </div>
    );
  }

  export default StoryGenerator