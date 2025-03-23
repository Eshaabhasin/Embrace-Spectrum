import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './Components/AuthForm/AuthForm';
import Home from './Components/Home/Home';
import './App.css';

function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<AuthForm />} />  {/* AuthForm is now part of Router */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
