import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import admin from 'firebase-admin';
// import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import axios from "axios"; // Add axios for API requests

const app = express();
const port = 3002;

// Gemini AI setup
const genAI = new GoogleGenerativeAI("AIzaSyBdEFLrPJ1pVPZzFJT5m-MOQQ9Y8vMKluU");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Job search API setup (using RapidAPI's JobSearch API as an example)
const JOBS_API_KEY = process.env.JOBS_API_KEY || "5c0cee33bbmsh8e649a10fa36eaep13e40fjsn74a7ea33dda7"; // Store this securely

// ✅ CORS middleware with allowed origin (your Vercel frontend)
app.use(cors({
  origin: ["https://embrace-spectrum.vercel.app", "http://localhost:5173"], // ⬅️ Allow your Vercel frontend
  origin: [
    "https://embrace-spectrum.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));

// ✅ Health check route
app.get("/test", (req, res) => {
  res.status(200).send("✅ Backend is up and running!");
});

// ✅ Clean response helper
const trimResponse = (message) => {
  return message ? message.trim() : "I couldn't generate a response.";
};

// ✅ Chatbot endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const result = await model.generateContent(message);
    const response = await result.response;
    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm not sure how to respond.";

    return res.status(200).json({ reply: trimResponse(text) });
  } catch (error) {
    console.error("Error in chat request:", error);
    return res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
      details: error.response?.data || "No additional details available.",
    });
  }
});

// ✅ Generate jobs based on profile - Now using a real jobs API
app.post("/generate-jobs", async (req, res) => {
  const { skills = [], location = "", accommodations = [], jobTitle = "" } = req.body;
  
  if (!skills.length && !jobTitle) {
    return res.status(400).json({ error: "At least skills or job title is required." });
  }
  
  try {
    // Step 1: Fetch real jobs from an API
    const jobsData = await fetchJobsFromAPI(jobTitle, skills, location);
    
    // Step 2: Use Gemini to analyze job matches and accommodations
    const enhancedJobs = await enhanceJobsWithGemini(jobsData, skills, accommodations);
    
    return res.status(200).json({ jobs: enhancedJobs });
  } catch (error) {
    console.error("Error generating jobs:", error);
    return res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
      details: error.toString()
    });
  }
});

// Function to fetch real jobs from a jobs API
async function fetchJobsFromAPI(jobTitle, skills, location) {
  try {
    console.log(`Fetching jobs with: Title=${jobTitle}, Skills=${skills.join(', ')}, Location=${location}`);
    
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: `${jobTitle} ${skills.join(' ')} ${location}`.trim(),
        page: '1',
        num_pages: '1'
      },
      headers: {
        'X-RapidAPI-Key': JOBS_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    };

    console.log('API request options:', JSON.stringify(options));
    const response = await axios.request(options);
    
    // Log the structure of the response to understand what we're getting
    console.log('Job API response structure:', Object.keys(response.data));
    console.log(`Jobs found: ${response.data.data ? response.data.data.length : 0}`);
    
    if (!response.data.data || response.data.data.length === 0) {
      console.log('Warning: No jobs found in API response');
    }
    
    return response.data.data || [];
  } catch (error) {
    // Enhanced error logging
    console.error("Error fetching jobs:", error.message);
    if (error.response) {
      console.error("API response error:", {
        status: error.response.status,
        data: error.response.data
      });
    }
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }
}

// Improve the enhanceJobsWithGemini function for better error handling
async function enhanceJobsWithGemini(jobs, skills, accommodations) {
  console.log(`Enhancing ${jobs.length} jobs with Gemini`);
  
  if (jobs.length === 0) {
    console.log('No jobs to enhance, returning empty array');
    return [];
  }

  try {
    // Create prompt for Gemini to analyze job matches
    const jobsData = jobs.slice(0, 5).map(job => ({  // Reduced to 5 jobs to prevent token limits
      title: job.job_title || "Unknown Title",
      company: job.employer_name || "Unknown Company",
      location: job.job_city || job.job_country || "Remote",
      description: job.job_description?.substring(0, 300) || "No description available"  // Shortened description
    }));

    console.log(`Prepared ${jobsData.length} jobs for Gemini analysis`);

    const prompt = `
      I have a job seeker with the following profile:
      Skills: ${skills.join(', ')}
      Needs accommodations for: ${accommodations.length > 0 ? accommodations.join(', ') : 'None specified'}
      
      Below are real job listings. For each job:
      1. Calculate a match percentage based on how well the person's skills match the job
      2. Suggest specific accommodations that would be helpful for this job based on their needs
      
      Job listings:
      ${JSON.stringify(jobsData, null, 2)}
      
      Return your analysis as valid JSON following this structure exactly:
      {
        "analyzedJobs": [
          {
            "title": "Original job title",
            "company": "Original company",
            "location": "Original location",
            "description": "Original description",
            "match": "Match percentage (e.g. 92% Match)",
            "accommodations": ["Specific Accommodation 1", "Specific Accommodation 2"]
          }
        ]
      }
      
      IMPORTANT: Make sure your response can be parsed as JSON. Do not include any text before or after the JSON.`;

    console.log('Sending prompt to Gemini for job analysis');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text() || "";
    
    console.log('Received Gemini response, length:', text.length);
    
    // Parse the JSON response - improved parsing
    let analysisData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
        console.log(`Successfully parsed JSON, found ${analysisData.analyzedJobs?.length || 0} analyzed jobs`);
      } else {
        console.error("No valid JSON found in Gemini response");
        console.log("Response text sample:", text.substring(0, 200) + "...");
        throw new Error("No valid JSON found in Gemini response");
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError.message);
      console.log("Failed JSON text sample:", text.substring(0, 200) + "...");
      throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
    }
    
    // Format the jobs with the analysis
    return analysisData.analyzedJobs.map((job, index) => ({
      id: index + 1,
      ...job
    }));
  } catch (error) {
    console.error("Error enhancing jobs with Gemini:", error.message);
    
    // More detailed fallback that preserves original job data
    return jobs.slice(0, 5).map((job, index) => ({
      id: index + 1,
      title: job.job_title || "Unknown Title",
      company: job.employer_name || "Unknown Company",
      location: job.job_city || job.job_country || "Remote",
      description: job.job_description?.substring(0, 300) || "No description available",
      match: "Analysis failed",
      accommodations: ["Analysis unavailable due to technical error"],
      error: error.message
    }));
  }
}

// Update the generate-jobs endpoint to provide better error information
app.post("/generate-jobs", async (req, res) => {
  console.log("Received generate-jobs request:", req.body);
  const { skills = [], location = "", accommodations = [], jobTitle = "" } = req.body;
  
  if (!skills.length && !jobTitle) {
    console.log("Bad request: missing skills or job title");
    return res.status(400).json({ error: "At least skills or job title is required." });
  }
  
  try {
    // Step 1: Fetch real jobs from an API
    console.log(`Searching for jobs with title: "${jobTitle}", skills: [${skills.join(', ')}], location: "${location}"`);
    const jobsData = await fetchJobsFromAPI(jobTitle, skills, location);
    
    console.log(`Found ${jobsData.length} jobs from API`);
    
    if (jobsData.length === 0) {
      // If no jobs found, return helpful message instead of empty array
      return res.status(200).json({ 
        jobs: [],
        message: "No matching jobs found. Try broadening your search terms."
      });
    }
    
    // Step 2: Use Gemini to analyze job matches and accommodations
    const enhancedJobs = await enhanceJobsWithGemini(jobsData, skills, accommodations);
    
    console.log(`Returning ${enhancedJobs.length} enhanced jobs`);
    return res.status(200).json({ 
      jobs: enhancedJobs,
      totalFound: jobsData.length
    });
  } catch (error) {
    console.error("Error generating jobs:", error);
    return res.status(500).json({
      error: `Job search error: ${error.message}`,
      jobs: [],
      success: false
    });
  }
});

// ✅ Generate story from drawing and prompt
app.post("/generate-story", async (req, res) => {
  const { prompt, imageBase64, includeDrawing = true } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    let generationParts = [];

    // Add prompt text
    generationParts.push({
      text: `Write a simple, engaging, and autism-friendly story based on this prompt: ${prompt}.
             The story should be easy to read and visualize.`
    });

    // Add drawing if provided
    if (includeDrawing && imageBase64) {
      generationParts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageBase64
        }
      });

      generationParts[0].text += " Use the drawing provided to inspire characters, settings, or plot elements in the story.";
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: generationParts }]
    });

    const response = result.response;
    const storyText = response.text() || "I couldn't generate a story.";

    return res.status(200).json({
      story: trimResponse(storyText),
      success: true
    });
  } catch (error) {
    console.error("Error generating story:", error);
    return res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
      details: error.toString(),
      success: false
    });
  }
});
app.post('/api/learn',async(req,res)=>{
  const userMessage=req.body.message
  if(!userMessage){
    return res.status(400).json({error:'Message is required.'});
  }
    try {
    // Generate content using Gemini
    const result = await model.generateContent(userMessage);
    const response = await result.response;  // Await the response object
    const text = response.candidates[0].content.parts[0].text; // Correct way to access text

    return res.status(200).json({ message: trimResponse(text) });
  } catch (error) {
    console.error("Error in chat request:", error);

    return res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
      details: error.response?.data || 'No details available',
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
