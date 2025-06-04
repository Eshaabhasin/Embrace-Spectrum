import React from "react";
import { Link } from "react-router-dom";

const cards = [
  { 
    title: "SenseScape", 
    desc: "A calming, interactive game with sensory-friendly environments for self-regulation.", 
    path: "/sensescape",
    emoji: "🌈"
  },
  { 
    title: "MoodBooster", 
    desc: "Fun mini-games and activities to quickly uplift your mood and build emotional resilience.", 
    path: "/moodbooster",
    emoji: "😊"
  },
];

const Game = () => {
  return (
    <>
      <div className="min-h-screen bg-[#6488e9] px-6 py-12 flex flex-col items-center mt-30">
          <h1 className="text-5xl font-bold text-white mb-15">
              Game Zone✨
            </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-6xl h-72">
          {cards.map((card, index) => (
            <Link
              to={card.path}
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20 transition-transform hover:scale-105 text-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{card.emoji}</span>
                <h2 className="text-3xl font-semibold">{card.title}</h2>
              </div>
              <p className="text-2xl opacity-90 py-5">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Game;