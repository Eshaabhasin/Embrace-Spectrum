import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios"; 
import { config } from 'dotenv';

config();

const app = express();
const port = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors({
  origin: ["https://embrace-spectrum.vercel.app", "http://localhost:5173" , "https://embrace-spectrum-testing.vercel.app", "https://embrace-spectrum-neuro.vercel.app"], 
  origin: [
    "https://embrace-spectrum-neuro.vercel.app",
    "https://embrace-spectrum-testing.vercel.app",
    "https://embrace-spectrum.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));


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

app.post('/api/search-jobs', async (req, res) => {
  try {
    const { query, location, workArrangement, skills, industries, nextPageToken } = req.body;
    
    console.log('Received job search request:', req.body);
    
    // Build search query
    let searchQuery = '';
    
    // Add skills to query
    if (skills && skills.length > 0) {
      searchQuery += skills.join(' OR ') + ' ';
    }
    
    // Add industries to query
    if (industries && industries.length > 0) {
      searchQuery += industries.join(' OR ') + ' ';
    }
    
    // Add work arrangement preferences
    if (workArrangement === 'remote') {
      searchQuery += 'remote OR "work from home" ';
    }
    
     searchQuery += 'inclusive OR diversity OR "neurodiversity friendly" OR accommodations';
    
    const serpApiParams = {
      engine: 'google_jobs',
      q: searchQuery.trim(),
      location: location || 'United States',
      api_key: process.env.SERPAPI_KEY,
      num: 20
    };
    
    // Add next_page_token for pagination if provided (DON'T use start parameter)
    if (nextPageToken) {
      serpApiParams.next_page_token = nextPageToken;
    }
    
    console.log('SerpAPI Request params:', serpApiParams);
    
    // Make request to SerpAPI
    const response = await axios.get('https://serpapi.com/search.json', {
      params: serpApiParams,
      timeout: 15000
    });
    
    console.log('SerpAPI Response status:', response.status);
    
    // Check for API errors
    if (response.data.error) {
      console.error('SerpAPI Error:', response.data.error);
      return res.status(400).json({
        error: 'Search API Error',
        message: response.data.error,
        success: false
      });
    }
    
    // Transform the data
    const jobs = (response.data.jobs_results || []).map(job => ({
      id: job.job_id || Math.random().toString(36).substr(2, 9),
      title: job.title || 'No title available',
      company: job.company_name || 'Company not specified',
      location: job.location || location || 'Location not specified',
      description: job.description || job.snippet || 'No description available',
      apply_link: job.apply_options?.[0]?.link || job.share_link || null,
      salary: job.salary_info ? `${job.salary_info.min || ''} - ${job.salary_info.max || ''}`.trim() : null,
      posted_date: job.detected_extensions?.posted_at || null,
      work_from_home: job.commute_time === null || job.title?.toLowerCase().includes('remote') || false,
      source: 'Google Jobs via SerpAPI'
    }));
    
    console.log(`Found ${jobs.length} jobs`);
    
    // Return response
    res.json({
      success: true,
      jobs: jobs,
      totalResults: response.data.search_information?.total_results || jobs.length,
      nextPageToken: response.data.serpapi_pagination?.next_page_token || null,
      hasNextPage: !!response.data.serpapi_pagination?.next_page_token,
      searchQuery: searchQuery.trim(),
      location: location
    });
    
  } catch (error) {
    console.error('Job search error:', error);
    
    // Handle different types of errors
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
      
      res.status(error.response.status || 500).json({
        error: 'API Error',
        message: error.response.data?.error || 'External API error occurred',
        success: false,
        details: error.response.data
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        error: 'Timeout',
        message: 'Request timed out. Please try again.',
        success: false
      });
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Network Error',
        message: 'Unable to connect to job search service.',
        success: false
      });
    } else {
      res.status(500).json({
        error: 'Server Error',
        message: 'Something went wrong while fetching jobs. Please try again.',
        success: false,
        details: error.message
      });
    }
  }
});

// Alternative job search endpoints (for different job boards)
app.post('/api/search-jobs-indeed', async (req, res) => {
  try {
    const { query, location } = req.body;

    if (!process.env.SERPAPI_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured' 
      });
    }

    const params = {
      engine: 'indeed_jobs',
      q: query,
      location: location,
      api_key: process.env.SERPAPI_KEY
    };

    const response = await axios.get('https://serpapi.com/search.json', { params });
    res.json(response.data);

  } catch (error) {
    console.error('Error fetching Indeed jobs:', error);
    res.status(500).json({
      error: 'Failed to fetch Indeed jobs',
      message: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong!'
  });
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
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { topic, count = 5 } = req.body;

    console.log(`🤖 Generating ${count} questions for topic: ${topic}`);

    const prompt = `Generate ${count} life skills scenarios for neurodivergent individuals focusing on practical social situations, workplace challenges, and self-advocacy. 

Create a JSON response with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "scenario": "Real-world scenario with emojis describing a sensory or social challenge",
      "question": "What's the best approach to handle this situation?",
      "options": [
        "Option A with emoji",
        "Option B with emoji", 
        "Option C with emoji",
        "Option D with emoji"
      ],
      "correct": 1,
      "explanation": "Explanation of why this approach works best, with encouraging tone and emoji"
    },
    {
      "id": 2,
      "type": "text",
      "scenario": "Scenario requiring open-ended communication skills",
      "question": "How would you communicate your needs in this situation?",
      "sampleAnswers": [
        "Sample response 1 with emoji",
        "Sample response 2 with emoji",
        "Sample response 3 with emoji"
      ]
    }
  ]
}

Focus on:
- Sensory processing challenges
- Social communication
- Workplace accommodations
- Self-advocacy
- Managing overwhelm
- Building relationships
- Setting boundaries

Make scenarios realistic and relatable. Use encouraging, supportive language.`;

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;

    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response format from Gemini API');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      throw new Error('Invalid question format from Gemini API');
    }

    console.log(`✅ Successfully generated ${parsedData.questions.length} questions`);
    res.json(parsedData);

  } catch (error) {
    console.error('❌ Error generating questions:', error.message);

    const fallbackQuestions = {
      "questions": [
        {
          "id": 1,
          "type": "mcq",
          "scenario": "🏢 You're in an open office and the constant noise is making it hard to focus on an important deadline. Your productivity is suffering and you're feeling overwhelmed.",
          "question": "What's the most effective way to handle this sensory challenge? 🎯",
          "options": [
            "🎧 Request noise-canceling headphones or ask to work in a quieter space",
            "😤 Tell everyone around you to be quieter",
            "😓 Try to push through and hope it gets better",
            "🏠 Call in sick to work from home"
          ],
          "correct": 0,
          "explanation": "Proactively requesting accommodations shows self-advocacy skills and creates a win-win solution. Most employers are willing to provide reasonable adjustments that help you perform your best! 🌟"
        },
        {
          "id": 2,
          "type": "text",
          "scenario": "🛍️ You're at the grocery store and the fluorescent lights are triggering a headache. The checkout lines are long and you're feeling overwhelmed by the sensory input.",
          "question": "How would you manage this situation while still completing your shopping? 💭",
          "sampleAnswers": [
            "I'd take a brief break outside to reset my nervous system, then return with a focused shopping list to minimize time inside 🌿",
            "I might ask store staff if there's a quieter checkout lane or use self-checkout to reduce social interaction 🏪",
            "I'd practice grounding techniques like deep breathing while focusing only on essential items 🧘‍♀️"
          ]
        }
      ]
    };

    console.log('📋 Using fallback questions due to API error');
    res.json(fallbackQuestions);
  }
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Life Skills Quiz API is running!',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🧠 Life Skills Quiz API',
    endpoints: {
      health: '/api/health',
      generateQuestions: 'POST /api/generate-questions'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
