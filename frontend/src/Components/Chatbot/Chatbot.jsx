import React, { useState } from "react";
import NavBar from "../NavBar/NavBar";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const response = await fetch("http://localhost:5001/chat", {
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
        <div className="bg-[#5C7EEC] min-h-screen px-10 flex flex-col">
            <NavBar></NavBar>
            {/* Main Section */}
            <div className="mt-20 flex justify-between items-start">
                {/* Left Section - Talk Coach Text */}
                <div>
                <h1 className="bg-gradient-to-r from-yellow-100 via-orange-300 to-red-300 bg-clip-text text-transparent text-8xl mt-10 font-extrabold tracking-wide">
                    Talk Coach
                </h1>
                    <p className="text-gray-200 text-2xl font-bold mt-8">
                        Your personal AI-powered communication mentor. Whether it's <br />
                        public speaking, social conversations, or professional discussions, <br />
                        Talk Coach is here to help.
                    </p>
                </div>

                <div className="absolute right-5 bottom-8 backdrop-blur-sm bg-white/70 p-6 rounded-xl shadow-lg w-[450px] h-[550px] flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-4 flex flex-col">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg max-w-[75%] ${
                                    msg.sender === "user"
                                        ? "bg-blue-500 text-white self-end text-right"
                                        : "bg-gray-200 text-black self-start text-left"
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input Field with Speech-to-Text Button */}
                    <div className="mt-auto flex">
                        <input
                            type="text"
                            className="flex-1 border p-2 rounded-lg"
                            placeholder="Type or speak your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            onClick={startListening}
                            className={`ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg ${
                                isListening ? "opacity-50" : ""
                            }`}
                            disabled={isListening}
                        >
                            🎤
                        </button>
                        <button
                            onClick={sendMessage}
                            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chatbot;
