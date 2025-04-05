import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';

const PDFEmotionReader = () => {
  const [pdfText, setPdfText] = useState('');
  const [textWithEmotions, setTextWithEmotions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const GOOGLE_API_KEY = 'AIzaSyBdEFLrPJ1pVPZzFJT5m-MOQQ9Y8vMKluU'; 
  const PDFCO_API_KEY = 'prableensingh0401@gmail.com_k0TNlK1YpJ4vrfdUVgbYMQJqFyZiv0Kd7P7mwB7DLj5Jk3XP4NSxb1sulOZDqlYO';

  const emotionMap = {
    'happy': { 
      color: 'bg-yellow-100 border-yellow-300', 
      textColor: 'text-yellow-800' 
    },
    'sad': { 
      color: 'bg-blue-100 border-blue-300', 
      textColor: 'text-blue-800' 
    },
    'excited': { 
      color: 'bg-green-100 border-green-300', 
      textColor: 'text-green-800' 
    },
    'calm': { 
      color: 'bg-gray-100 border-gray-300', 
      textColor: 'text-gray-800' 
    },
    'angry': { 
      color: 'bg-red-100 border-red-300', 
      textColor: 'text-red-800' 
    },
    'neutral': { 
      color: 'bg-gray-50 border-gray-200', 
      textColor: 'text-gray-700' 
    }
  };

  const extractPDFText = async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      let formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await axios.post('https://api.pdf.co/v1/file/upload', formData, {
        headers: {
          'x-api-key': PDFCO_API_KEY,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!uploadResponse.data.url) {
        throw new Error('File upload failed.');
      }

      const fileUrl = uploadResponse.data.url;

      const textResponse = await axios.post(
        'https://api.pdf.co/v1/pdf/convert/to/text',
        { url: fileUrl },
        {
          headers: {
            'x-api-key': PDFCO_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (textResponse.data.error) {
        throw new Error('Error extracting text.');
      }

      const textFileUrl = textResponse.data.url;
      const textData = await axios.get(textFileUrl);

      return textData.data;
    } catch (error) {
      console.error('PDF text extraction error:', error);
      setError('Failed to extract text from the PDF.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Advanced emotion and emoji analysis function
  const analyzeEmotions = async (text) => {
    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const truncatedText = text.slice(0, 5000);

      const prompt = `
        Deeply analyze the emotional tone of the following text. For each significant paragraph, provide:
        1. The primary emotion (choose from: happy, sad, excited, calm, angry, neutral)
        2. An appropriate emoji that precisely captures the emotional essence
        3. The intensity of the emotion (low/medium/high)

        Return a JSON array in this format:
        [
          { 
            "paragraph": "Text excerpt", 
            "emotion": "primary emotion", 
            "emoji": "most representative emoji",
            "intensity": "low/medium/high" 
          }
        ]

        Text: ${truncatedText}
      `;

      const result = await model.generateContent(prompt);
      const rawResponse = await result.response.text();

      // Clean and parse response
      const cleanedResponse = rawResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // Parse JSON safely
      const emotionData = JSON.parse(cleanedResponse);

      if (!Array.isArray(emotionData)) {
        throw new Error('Invalid JSON format in Gemini response.');
      }

      // Ensure emotion is lowercase and emoji exists
      const processedEmotionData = emotionData.map(item => ({
        ...item,
        emotion: item.emotion.toLowerCase(),
        emoji: item.emoji || '😶', // Fallback emoji if none provided
      }));

      setTextWithEmotions(processedEmotionData);
    } catch (error) {
      console.error('Emotion analysis error:', error);
      setError(`Emotion analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // File drop handler (previous implementation remains the same)
  const handleFileDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;

    setIsLoading(true);
    setError(null);
    setTextWithEmotions([]);

    try {
      const file = acceptedFiles[0];
      const extractedText = await extractPDFText(file);
      
      if (extractedText) {
        setPdfText(extractedText);
        await analyzeEmotions(extractedText);
      } else {
        setError('No text could be extracted from the PDF.');
      }
    } catch (error) {
      setError(`File processing error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  // Text-to-speech function
  const speakText = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser');
    }
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed p-10 text-center cursor-pointer transition-colors duration-200 
        ${isDragActive ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive ? 'Drop the PDF here ...' : 'Drag & drop a PDF file here, or click to select'}
        </p>
      </div>

      {isLoading && (
        <div className="text-center mt-4 text-white flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing PDF... Please wait.
        </div>
      )}
      
      {error && <div className="text-center mt-4 text-red-500">{error}</div>}

      {textWithEmotions.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-2xl text-white font-semibold mb-4 text-center">Emotional Journey of Your Document 📖✨</h2>
          {textWithEmotions.map((item, index) => {
            const emotionDetails = emotionMap[item.emotion] || emotionMap['neutral'];
            return (
              <div 
                key={index} 
                className={`
                  p-5 rounded-lg shadow-md border-l-4 
                  ${emotionDetails.color} 
                  ${emotionDetails.textColor} 
                  transform transition-all duration-300 hover:scale-[1.02]
                `}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{item.emoji}</div>
                  <div className="flex-1">
                    <p className="mb-2 text-sm font-medium">{item.paragraph}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-sm capitalize">
                          {item.emotion} Emotion 
                        </span>
                      </div>
                      <button 
                        onClick={() => speakText(item.paragraph)}
                        className={`
                          px-3 py-1 rounded text-sm bg-amber-50 
                          ${emotionDetails.textColor.replace('text-', 'bg-')} 
                          bg-opacity-20 hover:bg-opacity-30 transition-all
                        `}
                      >
                        🔊 Read Aloud
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PDFEmotionReader;