import React, {useState} from "react";
import axios from "axios";

function StoryGenerator({ getCanvasImage }) {
    const [story, setStory] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [storyGenerated, setStoryGenerated] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
  
    const generateStory = async () => {
      setLoading(true);
      setStory("");
      setTitle("");
      setError("");
      setCurrentPage(1);
  
      try {
        const requestData = {
          imageBase64: getCanvasImage(),
          includeDrawing: true,
          prompt: "Write a children's story with a title about this drawing. Include relevant emojis in the story text." 
        };
  
        const response = await axios.post("http://localhost:3000/generate-story", requestData);
  
        if (response.data && response.data.story) {
          const storyText = response.data.story;
          let extractedTitle = "";
          
          const firstLine = storyText.split('\n')[0];
          if (firstLine && (firstLine.includes("Title:") || firstLine.includes("#"))) {
            extractedTitle = firstLine.replace("Title:", "").replace("#", "").trim();
            setStory(storyText.substring(storyText.indexOf('\n')+1).trim());
          } else {
            extractedTitle = "My Creative Story ✨";
            setStory(storyText);
          }
          
          setTitle(extractedTitle);
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
      setTitle("");
      setCurrentPage(1);
      stopSpeaking();
    };

    const paragraphs = story.split('\n').filter(p => p.trim());
    const paragraphsPerPage = 3;
    const totalPages = Math.ceil(paragraphs.length / paragraphsPerPage);
    
    const nextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
        stopSpeaking();
      }
    };

    const prevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(prev => prev - 1);
        stopSpeaking();
      }
    };

    const speakText = () => {
      if ('speechSynthesis' in window) {
        const currentParagraphs = paragraphs
          .slice((currentPage - 1) * paragraphsPerPage, currentPage * paragraphsPerPage)
          .join(' ');
        
        const utterance = new SpeechSynthesisUtterance(currentParagraphs);
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    };

    const stopSpeaking = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };

    const downloadPDF = () => {
      const element = document.createElement('a');
      const file = new Blob([`${title}\n\n${story}`], {type: 'application/pdf'});
      element.href = URL.createObjectURL(file);
      element.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };
  
    return (
      <div className="w-full max-w-4xl h-[84vh] ml-5 mt-[-10vh] p-3 rounded-lg font-lato">
        <h2 className="text-3xl font-bold mb-4 text-white">Generate your imagination ✨</h2>
        
        {!storyGenerated ? (
          <>            
            <button 
              className="w-full bg-blue-500 text-white p-3 rounded-2xl  hover:bg-blue-600 transition text-lg font-medium disabled:bg-blue-300 backdrop-blur-lg" 
              onClick={generateStory}
              disabled={loading}
            >
              {loading ? "Generating Story..." : "Generate Story from Drawing ✏️"}
            </button>
            
            {error && <p className="mt-3 text-red-300">{error}</p>}
            
            {loading && (
              <div className="mt-6 flex justify-center">
                <div className="loader w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-2 border rounded-2xl bg-white backdrop-blur-lg text-black h-[calc(100%-70px)] flex flex-col shadow-2xl">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold">{title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={isSpeaking ? stopSpeaking : speakText}
                      className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    >
                      {isSpeaking ? "Stop 🔇" : "Read"} 
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    >
                      Download
                    </button>
                  </div>
                </div>
                <div className="border-b-2 border-blue-600/50 mb-6"></div>
                <div className="prose max-w-none px-3">
                  {paragraphs
                    .slice((currentPage - 1) * paragraphsPerPage, currentPage * paragraphsPerPage)
                    .map((paragraph, index) => (
                      <p key={index} className="mb-6 text-lg leading-relaxed">{paragraph}</p>
                    ))
                  }
                </div>
              </div>
            </div>
            
            <div className="border-t border-blue-600/50 bg-white/70 backdrop-blur-lg p-4 rounded-2xl">
              <div className="flex justify-between items-center">
                <button 
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 backdrop-blur-lg"
                >
                  ⬅️ Previous
                </button>
                
                <div className="px-4 py-2 bg-blue-100/50 backdrop-blur-lg rounded-md text-black">
                  Page {currentPage} of {totalPages}
                </div>

                <button 
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 backdrop-blur-lg"
                >
                  Next ➡️
                </button>
              </div>
              <button 
                className="mt-4 w-full bg-blue-500 text-white p-1 rounded-md hover:bg-blue-600 transition text-lg font-medium backdrop-blur-lg"
                onClick={resetStory}
              >
                Generate Another Story 🎨
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default StoryGenerator
