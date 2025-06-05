import React, {useState, useEffect} from "react";
import axios from "axios";
import "./StoryComponent.css";

function StoryGenerator({ getCanvasImage }) {
    const [story, setStory] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [storyGenerated, setStoryGenerated] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
  
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
          prompt: "Write a children's story with a title about this drawing. Include relevant emojis in the story text and dont add other details just provide the story." 
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
      element.clic  k();
      document.body.removeChild(element);
    };
    
    useEffect(() => {
      localStorage.removeItem('feelReaderNotificationSeen');
      
      const hasSeenNotification = localStorage.getItem('feelReaderNotificationSeen');
      if (!hasSeenNotification) {
        setTimeout(() => {
          setShowNotification(true);
        }, 1000);
      }
    }, []);
    
    const dismissNotification = () => {
      setShowNotification(false);
      localStorage.setItem('feelReaderNotificationSeen', 'true');
    };

  
    return (
      <div className="w-full max-w-4xl h-[84vh] ml-5 mt-[-10vh] p-3 rounded-lg font-lato">
        <h2 className="text-3xl font-bold mb-4 text-white">Generate your imagination ✨</h2>
        
        {/* Feel Reader Notification */}
        {showNotification && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 bg-opacity-50">
            <div className="bg-white rounded-xl top-10 shadow-2xl p-6 max-w-2xl w-11/12 mx-auto relative border-l-8 border-blue-500 animate-fadeIn">
              <button 
                onClick={dismissNotification}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
                aria-label="Close notification"
              >
                ✕
              </button>
              
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Welcome to sketch Tales 📚</h3>
              </div>
              
              <p className="mb-4 text-gray-700">
                Feel Reader transforms your drawings into personalized stories! Express your creativity and improve reading skills with this interactive tool.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-bold text-blue-800 mb-2">How to use:</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Draw anything on the canvas using the drawing tools</li>
                  <li>Click <strong>Generate Story</strong> to create a story from your drawing</li>
                  <li>Use the <strong>Read</strong> button to listen to your story</li>
                  <li>Navigate through pages with <strong>Next</strong> and <strong>Previous</strong> buttons</li>
                  <li>Download your story as a PDF to save or print</li>
                </ul>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={dismissNotification}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
        
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
