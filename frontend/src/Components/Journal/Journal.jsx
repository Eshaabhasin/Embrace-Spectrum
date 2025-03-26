import React, { useState } from "react";
import { FaMicrophone, FaCheckCircle, FaPlus, FaCalendarAlt } from "react-icons/fa";

const Journal = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState("");
  const [priority, setPriority] = useState("None");
  const [tags, setTags] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  // Mood Colors
  const moods = [
    { color: "bg-red-500", label: "Frustrated" },
    { color: "bg-blue-500", label: "Calm" },
    { color: "bg-green-500", label: "Happy" },
    { color: "bg-yellow-500", label: "Anxious" },
  ];

  // Tags
  const availableTags = ["Fun", "Social", "Work", "Health"];

  // Start voice recording
  const startListening = () => {
    if (!window.webkitSpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      setDescription(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Add checklist item
  const addChecklistItem = () => {
    if (newChecklistItem.trim() !== "") {
      setChecklist([...checklist, newChecklistItem]);
      setNewChecklistItem("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Create Journal Entry</h2>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 rounded mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description Input with Speech-to-Text */}
        <div className="relative">
          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded mb-3"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            className={`absolute right-3 bottom-3 ${
              isListening ? "text-red-500" : "text-gray-500"
            }`}
            onClick={startListening}
          >
            <FaMicrophone size={20} />
          </button>
        </div>

        {/* Priority Selection */}
        <div className="mb-3">
          <p className="font-semibold">Priority</p>
          <div className="flex gap-2">
            {["None", "Low", "Medium", "High"].map((level) => (
              <button
                key={level}
                className={`px-3 py-1 rounded ${
                  priority === level ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setPriority(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Mood Selection */}
        <div className="mb-3">
          <p className="font-semibold">Mood</p>
          <div className="grid grid-cols-2 gap-2">
            {moods.map((m) => (
              <button
                key={m.label}
                className={`flex items-center justify-center p-2 rounded-lg ${m.color} text-white`}
                onClick={() => setMood(m.label)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Selection */}
        <div className="mb-3">
          <p className="font-semibold">Tags</p>
          <div className="flex gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                className={`px-3 py-1 rounded ${
                  tags.includes(tag) ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
                onClick={() =>
                  setTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  )
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="mb-3">
          <p className="font-semibold">Checklist</p>
          <div className="flex gap-2">
            <input
              type="text"
              className="border p-2 rounded w-full"
              placeholder="Add item..."
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
            />
            <button
              className="bg-black text-white p-2 rounded"
              onClick={addChecklistItem}
            >
              <FaPlus />
            </button>
          </div>
          <ul className="mt-2">
            {checklist.map((item, index) => (
              <li key={index} className="flex items-center gap-2 mt-1">
                <FaCheckCircle className="text-green-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Date Selection */}
        <div className="mb-3">
          <p className="font-semibold">Date</p>
          <div className="flex items-center border p-2 rounded">
            <FaCalendarAlt className="text-gray-500 mr-2" />
            <input
              type="date"
              className="w-full focus:outline-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button className="bg-purple-500 text-white w-full p-2 rounded mt-4">
          Save Entry
        </button>
      </div>
    </div>
  );
};

export default Journal;
