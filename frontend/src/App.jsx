import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home';
import Chatbot from './Components/Chatbot/Chatbot';
import SentimentAnalyser from './Components/SentimentAnalysis/SentimentAnalyser';
import GeminiLive from './Components/GeminiLive/GeminiLIve';
import NeurodiversityJobPortal from './Components/JobSearch/JobSearch';
import JournalBoard from './Components/JournalBoard/JournalBoard';
import PaintAndStory from './Components/StoryGenerator/StoryGeneratorComponent';

function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chatbot" element={<Chatbot/>}/>
        <Route path="/sketchTales" element={<PaintAndStory/>}/>
        <Route path="/feelReader" element={<SentimentAnalyser/>}/>
        <Route path="/geminiLive" element={<GeminiLive/>}/>
        <Route path="/journalboard" element={<JournalBoard/>}/>
        <Route path="/jobs" element={<NeurodiversityJobPortal/>}/>
      </Routes>
    </Router>
  );
}

export default App;
