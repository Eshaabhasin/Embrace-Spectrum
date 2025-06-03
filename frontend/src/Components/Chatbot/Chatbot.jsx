import React, { useState, useEffect } from "react";
import { Mic, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const welcomeMessage = {
            text: "Hi there! I'm **Solace**, your friendly and caring AI companion. I'm here to support you at your pace, in your way — whether you're navigating conversations, expressing yourself, or just need a safe space to talk. 💙",
            sender: "bot"
        };
        setMessages([welcomeMessage]);
        
        // Check if notification has been shown before
        const hasShownNotification = sessionStorage.getItem('solace_talkcoach_notification');
        
        if (!hasShownNotification) {
            // Show notification after 10 seconds
            const timer = setTimeout(() => {
                setShowNotification(true);
            }, 10000);
            
            return () => clearTimeout(timer);
        }
    }, []);

    const closeNotification = () => {
        // Mark notification as shown for this session
        sessionStorage.setItem('solace_talkcoach_notification', 'true');
        setShowNotification(false);
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const response = await fetch("http://localhost:3000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();
            const botMessage = { text: data.reply, sender: "bot" };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const startListening = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Your browser does not support Speech Recognition.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };

        recognition.start();
    };

    return (
        <>
           <div className="bg-[#6488EA] min-h-screen px-10 flex flex-col">
                {/* Talk Coach Notification */}
                {showNotification && (
                    <div className="fixed bottom-5 right-5 max-w-sm bg-white rounded-lg shadow-lg p-4 border-l-4 border-[#6488e9] animate-fadeIn z-50">
                        <div className="flex items-start">
                            <div className="ml-3 w-80 flex-1 pt-0.5">
                                <p className="text-sm font-medium text-gray-900">Try Talk Coach</p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Practice conversations with our Talk Coach using Gemini Live for more interactive communication practice.
                                </p>
                                <div className="mt-3 flex space-x-3">
                                    <Link
                                        to="/GeminiLive"
                                        className="bg-[#6488e9] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#5070d0]"
                                    >
                                        Try Talk Coach
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={closeNotification}
                                        className="bg-white text-gray-700 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex">
                                <button
                                    onClick={closeNotification}
                                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mt-20 flex justify-between items-start">
                    <div>
                        <h1 className="bg-gradient-to-r from-yellow-100 via-orange-300 to-red-300 bg-clip-text text-transparent text-7xl mt-10 font-extrabold tracking-wide">
                            Solace
                        </h1>
                        <p className="text-gray-200 text-2xl font-bold mt-3">
                            Your personal AI-powered communication mentor. Whether it's <br />
                            public speaking, social conversations, or professional discussions, <br />
                            Talk Coach is here to help.
                        </p>
                    </div>

                    <div className="absolute right-7 bottom-8 backdrop-blur-sm bg-white/60 p-6 rounded-xl shadow-lg w-[420px] h-[530px] flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-4 flex flex-col scrollbar-hide">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg max-w-[75%] whitespace-pre-wrap ${
                                        msg.sender === "user"
                                            ? "bg-blue-500 text-white self-end text-right"
                                            : "bg-gray-200 text-black self-start text-left"
                                    }`}
                                >
                                    {msg.sender === "bot" ? (
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Input Field with Speech-to-Text and Send Buttons */}
                        <div className="mt-3 flex items-center">
                            <input
                                type="text"
                                className="flex-1 border p-2 rounded-2xl"
                                placeholder="Type or speak your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            />
                            <button
                                onClick={startListening}
                                className={`ml-2 bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center ${
                                    isListening ? "opacity-50" : ""
                                }`}
                                disabled={isListening}
                            >
                                <Mic size={20} />
                            </button>
                            <button
                                onClick={sendMessage}
                                className="ml-2 bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Chatbot;