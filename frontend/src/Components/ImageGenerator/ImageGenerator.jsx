import React, { useState } from "react";
import axios from "axios";

function StoryGenerator() {
    const [prompt, setPrompt] = useState("");
    const [story, setStory] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const generateStory = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setStory("");
        setError("");

        try {
            const response = await axios.post("http://localhost:5001/generate-story", { prompt });

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
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                {/* Left Side: Prompt Input */}
                <div className="bg-white p-6 shadow-lg rounded-lg">
                    <h1 className="text-3xl font-bold mb-4 text-blue-700">📖 AI Story Generator</h1>
                    
                    <textarea
                        className="w-full p-3 border rounded-md focus:ring focus:ring-blue-300"
                        placeholder="Enter a story prompt..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    
                    <button 
                        className="mt-3 w-full px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
                        onClick={generateStory}
                        disabled={loading}
                    >
                        {loading ? "Generating..." : "Generate Story"}
                    </button>

                    {error && (
                        <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                {/* Right Side: Storybook UI */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-100 p-6 shadow-xl rounded-lg border border-yellow-200">
                    <h2 className="text-2xl font-semibold text-orange-700 mb-3">📜 Your Story</h2>
                    
                    {loading ? (
                        <p className="text-gray-600 italic">Generating story...</p>
                    ) : story ? (
                        <div className="p-4 bg-white rounded-lg shadow-lg border-l-4 border-orange-500">
                            <p className="text-gray-700 text-lg leading-relaxed">{story}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">Your story will appear here...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StoryGenerator;
