import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';

const PDFEmotionReader = () => {
  const [pdfText, setPdfText] = useState('');
  const [textWithEmotions, setTextWithEmotions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Keys
  const GOOGLE_API_KEY = 'AIzaSyCN7qtGsHboeYuMffK-eyBpvMLVP5XHemc'; 
  const PDFCO_API_KEY = 'prableensingh0401@gmail.com_k0TNlK1YpJ4vrfdUVgbYMQJqFyZiv0Kd7P7mwB7DLj5Jk3XP4NSxb1sulOZDqlYO';

  // Emotion color mapping
  const getEmotionColor = useCallback((emotion) => {
    const emotionColors = {
      'happy': 'bg-yellow-100',
      'sad': 'bg-blue-100',
      'excited': 'bg-green-100',
      'calm': 'bg-gray-100',
      'angry': 'bg-red-100',
      'neutral': 'bg-gray-50'
    };
    return emotionColors[emotion.toLowerCase()] || 'bg-gray-50';
  }, []);

  const extractPDFText = async (file) => {
    setIsLoading(true);
    setError(null);

    try {
        // Step 1: Upload the file to PDF.co
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

        const fileUrl = uploadResponse.data.url; // Get uploaded file URL

        // Step 2: Extract text from the uploaded PDF
        const textResponse = await axios.post(
            'https://api.pdf.co/v1/pdf/convert/to/text',
            { url: fileUrl }, // Send file URL instead of file
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

        // Step 3: Fetch the text from the returned URL
        const textFileUrl = textResponse.data.url; // Extracted text file URL
        const textData = await axios.get(textFileUrl);

        return textData.data; // Return the actual extracted text
    } catch (error) {
        console.error('PDF text extraction error:', error);
        setError('Failed to extract text from the PDF.');
        return null;
    } finally {
        setIsLoading(false);
    }
};

  const handleFileDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;

    setIsLoading(true);
    setError(null);
    setTextWithEmotions([]);

    try {
      const file = acceptedFiles[0];

      // Extract text from PDF
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

  // Emotion analysis function
  const analyzeEmotions = async (text) => {
    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Limit text length to prevent exceeding token limit
      const truncatedText = text.slice(0, 5000);

      const prompt = `
        Analyze the emotional tone of the following text and return a JSON array:
        [
          { "paragraph": "Text excerpt", "emotion": "primary emotion", "intensity": "low/medium/high" }
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

      setTextWithEmotions(emotionData);
    } catch (error) {
      console.error('Emotion analysis error:', error);
      setError(`Emotion analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="container mx-auto p-6 max-w-2xl">
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

      {isLoading && <div className="text-center mt-4 text-blue-500">Processing PDF... Please wait.</div>}
      {error && <div className="text-center mt-4 text-red-500">{error}</div>}

      {textWithEmotions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Emotion Analysis</h2>
          {textWithEmotions.map((item, index) => (
            <div key={index} className={`p-4 mb-4 rounded ${getEmotionColor(item.emotion)}`}>
              <p className="mb-2 text-sm">{item.paragraph}</p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">
                  Emotion: {item.emotion} (Intensity: {item.intensity})
                </span>
                <button 
                  onClick={() => speakText(item.paragraph)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  🔊 Read Aloud
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PDFEmotionReader;
