import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Briefcase, Heart, Settings, Search, Loader2, BookOpen, Award, Users, Clock, Home, Wifi, Plus, X } from 'lucide-react';
import NavBar from '../NavBar/NavBar';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {db, auth} from '../../../firebase'

const JobSearchComponent = () => {
  const { isLoaded, user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [showJobs, setShowJobs] = useState(false);
  const [savePreferences, setSavePreferences] = useState(true);
  const [skillInput, setSkillInput] = useState('');
  const [strengthInput, setStrengthInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  
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
    skills: [],
    strengths: [],
    preferredIndustries: [],
    
    // Step 3: Accommodations
    jobPreferences: {
      remoteWork: false,
      flexibleHours: false,
      quietWorkspace: false,
      structuredTasks: false,
      clearCommunication: false,
      mentorshipSupport: false
    },
    additionalAccommodations: ''
  });


  // Get the user ID
  const clerkUserId = user?.id;

  // Load existing profile on mount
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!clerkUserId || !isLoaded) return; // CHANGED: Added !isLoaded check
      
      try {
        const docRef = doc(db, 'jobSearchProfiles', clerkUserId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setFormData(profileData);
          console.log('Profile loaded successfully:', profileData);
        } else {
          console.log('No existing profile found');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Optional: Show user-friendly error message
        alert('Failed to load your profile. Please try again.');
      }
    };

    loadExistingProfile();
    }, [clerkUserId, isLoaded]); 


  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addToArrayField = (field, value, inputSetter) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      inputSetter('');
    }
  };

  const removeFromArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveToFirebase = async () => {
    if (!clerkUserId) {
      console.error('No user ID provided');
      alert('User authentication required. Please log in again.');
      return false;
    }

    try {
      await setDoc(doc(db, 'jobSearchProfiles', clerkUserId), {
        ...formData,
        userId: clerkUserId,
        updatedAt: new Date().toISOString(),
        createdAt: formData.createdAt || new Date().toISOString()
      });
      console.log('Profile saved successfully for user:', clerkUserId);
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save your profile. Please check your connection and try again.');
      return false;
    }
  };

  const fetchJobs = async () => {
  try {
    // Prepare the request payload
      const requestPayload = {
        query: '', // Let the backend construct the query
        location: formData.location || '',
        workArrangement: formData.preferredWorkArrangement,
        skills: formData.skills || [],
        industries: formData.preferredIndustries || []
      };

      console.log('Sending request to backend:', requestPayload);

      // Make request to your backend server
      const API_BASE_URL = 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/search-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // The backend already transforms the data, so we can use it directly
      const jobs = data.jobs || [];

      // Filter jobs based on user preferences (same logic as before)
      const filteredJobs = jobs.filter(job => {
        if (formData.jobPreferences?.remoteWork) {
          const isRemoteJob = job.work_from_home || 
                            job.title.toLowerCase().includes('remote') || 
                            job.description.toLowerCase().includes('remote') ||
                            job.description.toLowerCase().includes('work from home');
          if (isRemoteJob) return true;
        }
        
        if (formData.jobPreferences?.flexibleHours) {
          const hasFlexibleHours = job.description.toLowerCase().includes('flexible') ||
                                  job.description.toLowerCase().includes('flex');
          if (hasFlexibleHours) return true;
        }
        
        return true;
      });

      // Sort to put preferred jobs first (same logic as before)
      const sortedJobs = filteredJobs.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        
        if (formData.preferredWorkArrangement === 'remote') {
          if (a.work_from_home || a.title.toLowerCase().includes('remote')) scoreA += 10;
          if (b.work_from_home || b.title.toLowerCase().includes('remote')) scoreB += 10;
        }
        
        formData.skills?.forEach(skill => {
          if (a.description.toLowerCase().includes(skill.toLowerCase())) scoreA += 5;
          if (b.description.toLowerCase().includes(skill.toLowerCase())) scoreB += 5;
        });
        
        return scoreB - scoreA;
      });

      setJobs(sortedJobs);
      console.log('Jobs fetched successfully:', sortedJobs.length, 'jobs found');
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      
      // Provide more specific error messages
      if (error.message.includes('429')) {
        alert('Too many requests. Please wait a moment and try again.');
      } else if (error.message.includes('401') || error.message.includes('Authentication')) {
        alert('API authentication error. Please check the server configuration.');
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        alert('Network error. Please check your internet connection and ensure the server is running.');
      } else {
        alert(`Failed to fetch jobs: ${error.message}`);
      }
      
      setJobs([]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      if (savePreferences) {
        const saved = await saveToFirebase();
        if (!saved) {
          alert('Failed to save preferences. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      setJobsLoading(true);
      await fetchJobs();
      setJobsLoading(false);
      setShowJobs(true);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  if (showJobs) {
    return (
      <>
      <NavBar></NavBar>
      <div className="min-h-screen p-6">
        <div className="max-w-8xl mt-25 mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Search className="text-blue-600" size={32} />
                Job Recommendations for You
              </h2>
              <button
                onClick={() => setShowJobs(false)}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors font-medium"
              >
                Back to Search
              </button>
            </div>
            
            {jobsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-xl text-gray-600">Finding perfect jobs for you...</p>
              </div>
            ) : jobs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-2 flex-1">{job.title}</h3>
                        {job.work_from_home && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
                            Remote
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2 flex items-center gap-2">
                        <Briefcase size={16} className="flex-shrink-0" />
                        <span className="truncate">{job.company}</span>
                      </p>
                      
                      <p className="text-gray-600 mb-3 flex items-center gap-2">
                        <MapPin size={16} className="flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </p>
                      
                      <p className="text-gray-700 mb-4 line-clamp-3 text-sm leading-relaxed">
                        {job.description.length > 150 
                          ? job.description.substring(0, 150) + '...' 
                          : job.description}
                      </p>
                      
                      {job.salary && (
                        <p className="text-green-600 font-semibold mb-3 flex items-center gap-2">
                          <span className="text-green-500">💰</span>
                          {job.salary}
                        </p>
                      )}
                      
                      {job.posted_date && (
                        <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                          <Clock size={14} />
                          Posted: {new Date(job.posted_date).toLocaleDateString()}
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open(job.apply_link, '_blank')}
                          disabled={!job.apply_link}
                          className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                            job.apply_link 
                              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {job.apply_link ? 'Apply Now' : 'No Link Available'}
                        </button>
                        
                        <button 
                          onClick={() => {
                            // You can implement a "save job" functionality here
                            console.log('Saving job:', job);
                            alert('Job saved! (Feature to be implemented)');
                          }}
                          className="bg-gray-100 text-gray-600 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                          title="Save Job"
                        >
                          <Heart size={18} />
                        </button>
                      </div>
                      
                      {job.source && (
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          via {job.source}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
              <div className="text-center py-12">
                <Search className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No jobs found yet</h3>
                <p className="text-gray-500 mb-6">We're working on finding the perfect opportunities for you!</p>
                <button
                  onClick={() => setShowJobs(false)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Refine Your Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <NavBar></NavBar>
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white mt-30 mb-20 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Heart className="text-pink-300" size={32} />
              Find Your Perfect Job
            </h1>
            <p className="text-blue-100 text-lg">Let's discover opportunities that celebrate your unique strengths! 🌟</p>
            
            {/* Progress Bar */}
            <div className="mt-6 flex items-center gap-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    currentStep >= step ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      currentStep > step ? 'bg-white' : 'bg-blue-500'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Users className="text-blue-600" size={28} />
                  Tell Us About Yourself
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Full Name ✨
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter your full name"
                      title="Enter your full name as you'd like it to appear to employers"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Email Address 📧
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="your.email@example.com"
                      title="Enter your email address for job notifications"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    <MapPin className="inline mr-2" size={20} />
                    Location 🌍
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="City, State or 'Remote'"
                    title="Enter your preferred work location"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Neurodiversity Type 🧠
                  </label>
                  <select
                    value={formData.neurodiversityType}
                    onChange={(e) => updateFormData('neurodiversityType', e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    title="Select your neurodiversity type to help us find suitable opportunities"
                  >
                    <option value="">Select your neurodiversity type</option>
                    <option value="autism">Autism Spectrum</option>
                    <option value="adhd">ADHD</option>
                    <option value="dyslexia">Dyslexia</option>
                    <option value="dyspraxia">Dyspraxia</option>
                    <option value="tourettes">Tourette's Syndrome</option>
                    <option value="multiple">Multiple conditions</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    <Home className="inline mr-2" size={20} />
                    Preferred Work Arrangement 💼
                  </label>
                  <select
                    value={formData.preferredWorkArrangement}
                    onChange={(e) => updateFormData('preferredWorkArrangement', e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    title="Choose your ideal work arrangement"
                  >
                    <option value="">Select work arrangement</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-site</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Skills & Experience */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Award className="text-blue-600" size={28} />
                  Your Skills & Experience
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      <BookOpen className="inline mr-2" size={20} />
                      Highest Education 🎓
                    </label>
                    <select
                      value={formData.highestEducation}
                      onChange={(e) => updateFormData('highestEducation', e.target.value)}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      title="Select your highest level of education"
                    >
                      <option value="">Select education level</option>
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
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      <Clock className="inline mr-2" size={20} />
                      Years of Experience ⏰
                    </label>
                    <select
                      value={formData.yearsOfExperience}
                      onChange={(e) => updateFormData('yearsOfExperience', e.target.value)}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      title="Select your years of work experience"
                    >
                      <option value="">Select experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="11-15">11-15 years</option>
                      <option value="15+">15+ years</option>
                    </select>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Skills 🛠️
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, () => addToArrayField('skills', skillInput, setSkillInput))}
                      className="flex-1 px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter a skill and press Enter"
                      title="Add your technical and soft skills"
                    />
                    <button
                      onClick={() => addToArrayField('skills', skillInput, setSkillInput)}
                      className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                      title="Add skill"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                        {skill}
                        <button
                          onClick={() => removeFromArrayField('skills', index)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Remove skill"
                        >
                          <X size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Your Strengths 💪
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={strengthInput}
                      onChange={(e) => setStrengthInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, () => addToArrayField('strengths', strengthInput, setStrengthInput))}
                      className="flex-1 px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter a strength and press Enter"
                      title="Add your personal and professional strengths"
                    />
                    <button
                      onClick={() => addToArrayField('strengths', strengthInput, setStrengthInput)}
                      className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-colors"
                      title="Add strength"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.strengths.map((strength, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                        {strength}
                        <button
                          onClick={() => removeFromArrayField('strengths', index)}
                          className="text-green-600 hover:text-green-800"
                          title="Remove strength"
                        >
                          <X size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Industries */}
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Preferred Industries 🏢
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={industryInput}
                      onChange={(e) => setIndustryInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, () => addToArrayField('preferredIndustries', industryInput, setIndustryInput))}
                      className="flex-1 px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter an industry and press Enter"
                      title="Add industries you're interested in working in"
                    />
                    <button
                      onClick={() => addToArrayField('preferredIndustries', industryInput, setIndustryInput)}
                      className="bg-purple-600 text-white px-4 py-3 rounded-xl hover:bg-purple-700 transition-colors"
                      title="Add industry"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredIndustries.map((industry, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                        {industry}
                        <button
                          onClick={() => removeFromArrayField('preferredIndustries', index)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Remove industry"
                        >
                          <X size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Accommodations */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Settings className="text-blue-600" size={28} />
                  Workplace Accommodations
                </h2>

                <p className="text-gray-600 text-lg mb-6">
                  Select the accommodations that would help you thrive in your ideal workplace 🌟
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'remoteWork', label: 'Remote Work Options', icon: <Home size={20} /> },
                    { key: 'flexibleHours', label: 'Flexible Working Hours', icon: <Clock size={20} /> },
                    { key: 'quietWorkspace', label: 'Quiet Workspace', icon: <Wifi size={20} /> },
                    { key: 'structuredTasks', label: 'Clearly Structured Tasks', icon: <BookOpen size={20} /> },
                    { key: 'clearCommunication', label: 'Clear Communication Protocols', icon: <Users size={20} /> },
                    { key: 'mentorshipSupport', label: 'Mentorship Support', icon: <Award size={20} /> }
                  ].map((pref) => (
                    <label key={pref.key} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.jobPreferences[pref.key]}
                        onChange={(e) => updateNestedFormData('jobPreferences', pref.key, e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="text-blue-600">{pref.icon}</div>
                      <span className="text-lg font-medium text-gray-700">{pref.label}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Additional Accommodations 📝
                  </label>
                  <textarea
                    value={formData.additionalAccommodations}
                    onChange={(e) => updateFormData('additionalAccommodations', e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    rows="4"
                    placeholder="Describe any other accommodations that would help you succeed..."
                    title="Enter any additional workplace accommodations you need"
                  />
                </div>

                <div className="bg-blue-50 p-6 rounded-xl">
                  <label className="flex items-center gap-3 text-lg">
                    <input
                      type="checkbox"
                      checked={savePreferences}
                      onChange={(e) => setSavePreferences(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <Heart className="text-pink-500" size={20} />
                    <span className="font-medium text-gray-700">
                      Save my preferences so I don't have to enter them again
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-lg transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                <ChevronLeft size={20} />
                Back
              </button>

              {currentStep === 3 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium text-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Finding Jobs...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Find My Jobs
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  Next Step
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default JobSearchComponent;