import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './Components/AuthForm/AuthForm';
import Home from './Components/Home/Home';
import Chatbot from './Components/Chatbot/Chatbot';
import ImageGenerator from './Components/ImageGenerator/ImageGenerator';
import './App.css';
import SentimentAnalyser from './Components/SentimentAnalysis/SentimentAnalyser';
import PaintApp from './Components/PaintApp/PaintApp';
import Journal from './Components/Journal/Journal';
function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<AuthForm />} />  
        <Route path="/home" element={<Home />} />
        <Route path="/chatbot" element={<Chatbot/>}/>
        <Route path="/image" element={<ImageGenerator/>}/>
        <Route path="/Sentiment" element={<SentimentAnalyser/>}/>
        <Route path="/paint" element={<PaintApp/>}/>
        <Route path="/journal" element={<Journal/>}/>
      </Routes>
    </Router>
  );
}

export default App;
