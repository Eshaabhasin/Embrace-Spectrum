import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './Components/AuthForm/AuthForm';
import Home from './Components/Home/Home';
import Chatbot from './Components/Chatbot/Chatbot';
import ImageGenerator from './Components/ImageGenerator/ImageGenerator';
import './App.css';

function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<AuthForm />} />  
        <Route path="/home" element={<Home />} />
        <Route path="/chatbot" element={<Chatbot/>}/>
        <Route path="/image" element={<ImageGenerator/>}/>
      </Routes>
    </Router>
  );
}

export default App;
