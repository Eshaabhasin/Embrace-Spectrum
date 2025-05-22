import React, { useState, useEffect } from 'react';

const NeurodiversityJobPortal = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: '',
    location: '',
    neurodiversityType: '',
    preferredWorkArrangement: '',
    
    // Step 2: Skills & Experience
    highestEducation: '',
    yearsOfExperience: '',
    skills: '',
    strengths: '',
    preferredIndustries: '',
    
    // Step 3: Accommodations
    jobPreferences: {
      remoteWork: false,
      flexibleHours: false,
      quietWorkspace: false,
      structuredEnvironment: false,
      visualAids: false,
      writtenInstructions: false,
      mentorSupport: false,
    },
    additionalAccommodations: ''
  });

  // Load saved jobs from localStorage when component mounts
  useEffect(() => {
    const savedJobsFromStorage = localStorage.getItem('savedJobs');
    if (savedJobsFromStorage) {
      setSavedJobs(JSON.parse(savedJobsFromStorage));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleCheckboxChange = (field) => {
    setFormData({
      ...formData,
      jobPreferences: {
        ...formData.jobPreferences,
        [field]: !formData.jobPreferences[field]
      }
    });
  };

  const nextStep = () => {
    if (currentStep === 3) {
      findJobs();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleApplyNow = (job) => {
    // In a real implementation, this would redirect to the job application page
    // For now, we'll open a new tab with a placeholder URL
    const applicationUrl = `https://neuroTalent.example.com/apply/${job.id}`;
    window.open(applicationUrl, '_blank');
  };

  const handleSaveJob = (job) => {
    // Check if job is already saved
    const isJobSaved = savedJobs.some(savedJob => savedJob.id === job.id);
    
    if (isJobSaved) {
      // If already saved, remove it
      const updatedSavedJobs = savedJobs.filter(savedJob => savedJob.id !== job.id);
      setSavedJobs(updatedSavedJobs);
      localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
      alert(`Removed "${job.title}" from saved jobs.`);
    } else {
      // If not saved, add it
      const updatedSavedJobs = [...savedJobs, job];
      setSavedJobs(updatedSavedJobs);
      localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
      alert(`Saved "${job.title}" to your saved jobs!`);
    }
  };

  const isJobSaved = (jobId) => {
    return savedJobs.some(job => job.id === jobId);
  };

  const findJobs = async () => {
    setIsLoading(true);
    setCurrentStep(4);
    setError(null);
    
    try {
      // Extract selected accommodations
      const selectedAccommodations = Object.entries(formData.jobPreferences)
        .filter(([_, isSelected]) => isSelected)
        .map(([key]) => {
          // Convert camelCase to readable format
          return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
        });
      
      // Extract skills as array (for the new API format)
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      // Format data for the new API
      const apiData = {
        skills: skillsArray,
        location: formData.location,
        accommodations: selectedAccommodations,
        jobTitle: formData.preferredIndustries // Using industries as a job title search term
      };
      
      // Call updated backend API endpoint
      const response = await fetch('http://localhost:3000/generate-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      // The new API should return data in the format {jobs: [...]}
      if (data.jobs && Array.isArray(data.jobs)) {
        setRecommendations(data.jobs);
      } else {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error fetching job recommendations:", err);
      setError("Failed to load job recommendations. Please try again.");
      
      // Fallback to mock data on error
      setRecommendations([
        {
          id: 1,
          title: "UX Designer - Neurodiversity Program",
          company: "Inclusive Tech Solutions",
          location: "Remote",
          description: "Looking for detail-oriented UX designers with unique perspectives. Our neurodiversity program provides accommodations including flexible schedules and quiet workspaces.",
          match: "92% Match",
          accommodations: ["Flexible Hours", "Quiet Workspace", "Written Instructions"]
        },
        {
          id: 2,
          title: "Software Developer - Autism at Work Program",
          company: "Global Software Inc.",
          location: "New York, NY (Hybrid)",
          description: "Join our specialized program for neurodivergent developers. We value your unique abilities and provide a supportive environment with needed accommodations.",
          match: "88% Match",
          accommodations: ["Structured Environment", "Mentorship", "Sensory-friendly Office"]
        },
        {
          id: 3,
          title: "Data Analyst - Neurodiversity Hiring Initiative",
          company: "DataFirst Analytics",
          location: "Remote",
          description: "Our neurodiversity hiring initiative seeks detail-focused analysts. We offer clear instructions and accommodate different working styles.",
          match: "85% Match",
          accommodations: ["Remote Work", "Visual Documentation", "Flexible Hours"]
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="bg-white p-6 rounded-2xl shadow-xl backdrop-blur-md border border-white/20">

      <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Full Name*</label>
          <input 
            type="text" 
            className="w-full p-3 border rounded-md" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Your full name"
          />
        </div>
        
        <div>
          <label className="block font-medium mb-1">Email Address*</label>
          <input 
            type="email" 
            className="w-full p-3 border rounded-md" 
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>
        
        <div>
          <label className="block font-medium mb-1">Location</label>
          <input 
            type="text" 
            className="w-full p-3 border rounded-md" 
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="City, State/Province, Country"
          />
        </div>
        
        <div>
          <label className="block font-medium mb-1">Neurodiversity Type (Optional)</label>
          <select 
            className="w-full p-3 border rounded-md"
            value={formData.neurodiversityType}
            onChange={(e) => handleInputChange('neurodiversityType', e.target.value)}
          >
            <option value="">Prefer not to say</option>
            <option value="autism">Autism/Autistic Spectrum</option>
            <option value="adhd">ADHD</option>
            <option value="dyslexia">Dyslexia</option>
            <option value="dyscalculia">Dyscalculia</option>
            <option value="dyspraxia">Dyspraxia</option>
            <option value="tourette">Tourette Syndrome</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block font-medium mb-1">Preferred Work Arrangement*</label>
          <select 
            className="w-full p-3 border rounded-md"
            value={formData.preferredWorkArrangement}
            onChange={(e) => handleInputChange('preferredWorkArrangement', e.target.value)}
          >
            <option value="">Select one</option>
            <option value="remote">Fully Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button 
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          onClick={nextStep}
        >
          Next: Skills & Experience
        </button>
      </div>
    </div>
  );

  // Step 2: Skills & Experience
  const renderStep2 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Skills & Experience</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Highest Education Level</label>
          <select 
            className="w-full p-3 border rounded-md"
            value={formData.highestEducation}
            onChange={(e) => handleInputChange('highestEducation', e.target.value)}
          >
            <option value="">Select one</option>
            <option value="high-school">High School</option>
            <option value="associate">Associate Degree</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="doctorate">Doctorate</option>
            <option value="certification">Professional Certification</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block font-medium mb-1">Years of Experience</label>
          <select 
            className="w-full p-3 border rounded-md"
            value={formData.yearsOfExperience}
            onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
          >
            <option value="">Select one</option>
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (3-5 years)</option>
            <option value="senior">Senior Level (6-10 years)</option>
            <option value="expert">Expert Level (10+ years)</option>
          </select>
        </div>
        
        <div>
          <label className="block font-medium mb-1">Core Skills & Qualifications*</label>
          <textarea 
            className="w-full p-3 border rounded-md h-24" 
            placeholder="List your key technical and professional skills (e.g., Python, UI/UX design, project management)"
            value={formData.skills}
            onChange={(e) => handleInputChange('skills', e.target.value)}
          ></textarea>
          <p className="text-sm text-gray-500 mt-1">Separate skills with commas (e.g., Python, JavaScript, Project Management)</p>
        </div>
        
        <div>
          <label className="block font-medium mb-1">Your Unique Strengths</label>
          <textarea 
            className="w-full p-3 border rounded-md h-24" 
            placeholder="What unique strengths do you bring? How does your neurodiversity empower you?"
            value={formData.strengths}
            onChange={(e) => handleInputChange('strengths', e.target.value)}
          ></textarea>
        </div>
        
        <div>
          <label className="block font-medium mb-1">Job Titles or Industries You're Interested In</label>
          <input 
            type="text" 
            className="w-full p-3 border rounded-md" 
            placeholder="e.g., Software Developer, Data Analyst, Marketing"
            value={formData.preferredIndustries}
            onChange={(e) => handleInputChange('preferredIndustries', e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">This will be used for job search terms</p>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button 
          className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition"
          onClick={prevStep}
        >
          Back
        </button>
        <button 
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          onClick={nextStep}
        >
          Next: Accommodations
        </button>
      </div>
    </div>
  );

  // Step 3: Accommodations
  const renderStep3 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Workplace Accommodations</h2>
      <p className="text-gray-600 mb-6">Select accommodations that would help you thrive in the workplace:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="remoteWork" 
            className="mr-2 h-5 w-5"
            checked={formData.jobPreferences.remoteWork}
            onChange={() => handleCheckboxChange('remoteWork')}
          />
          <label htmlFor="remoteWork">Remote work options</label>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="flexibleHours" 
            className="mr-2 h-5 w-5"
            checked={formData.jobPreferences.flexibleHours}
            onChange={() => handleCheckboxChange('flexibleHours')}
          />
          <label htmlFor="flexibleHours">Flexible working hours</label>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="quietWorkspace" 
            className="mr-2 h-5 w-5"
            checked={formData.jobPreferences.quietWorkspace}
            onChange={() => handleCheckboxChange('quietWorkspace')}
          />
          <label htmlFor="quietWorkspace">Quiet workspace</label>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="structuredEnvironment" 
            className="mr-2 h-5 w-5"
            checked={formData.jobPreferences.structuredEnvironment}
            onChange={() => handleCheckboxChange('structuredEnvironment')}
          />
          <label htmlFor="structuredEnvironment">Structured environment</label>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="visualAids" 
            className="mr-2 h-5 w-5"
            checked={formData.jobPreferences.visualAids}
            onChange={() => handleCheckboxChange('visualAids')}
          />
          <label htmlFor="visualAids">Visual aids and instructions</label>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="writtenInstructions" 
            className="mr-2 h-5 w-5"
            checked={formData.jobPreferences.writtenInstructions}
            onChange={() => handleCheckboxChange('writtenInstructions')}
          />
          <label htmlFor="writtenInstructions">Written instructions</label>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="mentorSupport" 
            className="mr-2 h-5 w-5"
            checked={formData.jobPreferences.mentorSupport}
            onChange={() => handleCheckboxChange('mentorSupport')}
          />
          <label htmlFor="mentorSupport">Mentor/buddy support</label>
        </div>
      </div>
      
      <div>
        <label className="block font-medium mb-1">Additional Needs or Preferences</label>
        <textarea 
          className="w-full p-3 border rounded-md h-24" 
          placeholder="Any other accommodations that would help you work at your best? (lighting, noise, communication style, etc.)"
          value={formData.additionalAccommodations}
          onChange={(e) => handleInputChange('additionalAccommodations', e.target.value)}
        ></textarea>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button 
          className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition"
          onClick={prevStep}
        >
          Back
        </button>
        <button 
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          onClick={nextStep}
        >
          Find Matching Jobs
        </button>
      </div>
    </div>
  );

  // Step 4: Job Recommendations
  const renderStep4 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Recommended Jobs for You</h2>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Finding personalized job matches with AI...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-6">
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={findJobs}
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <p className="mb-6 text-gray-600">
            Based on your profile and preferences, we found these real jobs that might be a good fit:
          </p>
          
          <div className="space-y-6">
            {recommendations.map(job => (
              <div key={job.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold">{job.title}</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{job.match}</span>
                </div>
                
                <p className="text-gray-700 mt-1">{job.company} • {job.location}</p>
                
                <p className="mt-3 text-gray-600">{job.description}</p>
                
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Recommended accommodations:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.accommodations.map((accommodation, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full"
                      >
                        {accommodation}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    onClick={() => handleApplyNow(job)}
                  >
                    Apply Now
                  </button>
                  <button 
                    className={`px-4 py-2 border rounded-md transition ${
                      isJobSaved(job.id) 
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => handleSaveJob(job)}
                  >
                    {isJobSaved(job.id) ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {savedJobs.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold mb-4">Your Saved Jobs</h3>
              <div className="space-y-4">
                {savedJobs.map(job => (
                  <div key={job.id} className="border border-yellow-200 bg-yellow-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                      </div>
                      <button 
                        className="text-gray-500 hover:text-red-500"
                        onClick={() => handleSaveJob(job)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-between">
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              onClick={() => setCurrentStep(1)}
            >
              Edit Profile
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={findJobs}
            >
              Search More Jobs
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Progress Indicator
  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center relative">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step}
            className={`z-10 flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
        ))}
        
        <div className="absolute top-5 h-1 w-full bg-gray-200 -z-10"></div>
        <div 
          className="absolute top-5 h-1 bg-blue-600 -z-5 transition-all"
          style={{ width: `${(currentStep - 1) * 33.3}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-2 text-[17px] text-white">
        <span>Basic Info</span>
        <span>Skills & Experience</span>
        <span>Accommodations</span>
        <span>Job Matches</span>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 py-10">
      <header className="mb-6">
        <div className="flex items-center mb-2">
          <a href="#" className="flex items-center justify-center w-10 h-10 mr-4">
            ←
          </a>
          <h1 className="text-3xl font-bold">NeuroTalent</h1>
        </div>
        <p className="text-gray-600 ml-14">Connecting neurodivergent talent with inclusive employers</p>
      </header>
      
      {renderProgressBar()}
      
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>NeuroTalent © 2025 | Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  );
};

export default NeurodiversityJobPortal;