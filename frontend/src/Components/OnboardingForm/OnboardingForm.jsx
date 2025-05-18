import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const OnboardingForm = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();

  // Form states
  const [formData, setFormData] = useState({
    preferredName: '',
    ageGroup: '',
    role: '',
    neurodiversityTypes: [],
    sensoryPreferences: [],
    communicationStyle: '',
    mainGoals: [],
    supportContext: ''
  });

  const [formStep, setFormStep] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [customNeurodiversity, setCustomNeurodiversity] = useState('');

  // Form options
  const ageGroups = ['Under 13', '13–17', '18–25', '26–40', 'Over 40'];
  const roles = ['Student', 'Parent', 'Educator', 'Therapist', 'Support Worker', 'Other'];
  const neurodiversityTypes = ['Autistic', 'ADHD', 'Dyslexic', 'Sensory Sensitive', 'Prefer not to say', 'Other'];
  const sensoryPreferences = ['Low brightness', 'No sound', 'More visuals', 'Text-to-speech', 'Larger text', 'High contrast', 'Reduced motion'];
  const communicationStyles = ['Visual', 'Text-based', 'Audio', 'Interactive', 'Gamified'];
  const mainGoalOptions = ['Improve speaking', 'Learn routines', 'Play learning games', 'Coaching', 'Explore resources', 'Other'];
  const supportContexts = ['Yes, with a parent', 'Yes, with a therapist', 'Yes, with an educator', 'No, I\'m using it alone'];

  // Check if user is already logged in
  useEffect(() => {
    if (isSignedIn && user) {
      // Pre-fill name if available from Clerk
      setFormData(prevData => ({
        ...prevData,
        preferredName: user.firstName || ''
      }));
    }
  }, [isSignedIn, user]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox/multi-select changes
  const handleMultiSelectChange = (e, category) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setFormData(prevData => {
      if (isChecked) {
        return {
          ...prevData,
          [category]: [...prevData[category], value]
        };
      } else {
        return {
          ...prevData,
          [category]: prevData[category].filter(item => item !== value)
        };
      }
    });
  };

  // Add custom entries
  const handleAddCustom = (type, value, setter) => {
    if (value.trim() !== '') {
      setFormData(prevData => ({
        ...prevData,
        [type]: [...prevData[type], value.trim()]
      }));
      setter('');
    }
  };

  // Handle navigation between form steps
  const nextStep = () => {
    setFormStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setFormStep(prevStep => prevStep - 1);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Here you would normally save the data to your database
      console.log('Form submitted:', formData);
      
      // Save onboarding completion status to localStorage immediately
      if (user) {
        localStorage.setItem(`onboarding-${user.id}`, 'true');
      }
      
      // Mark as completed
      setFormSubmitted(true);
      
      // Important: Force a delay before redirect to ensure localStorage is saved
      setTimeout(() => {
        // Force reload the page to ensure AuthWrapper picks up the localStorage change
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Render progress bar
  const renderProgressBar = () => {
    const totalSteps = 4;
    const progress = ((formStep + 1) / totalSteps) * 100;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
        <p className="text-sm text-gray-500 mt-2">Step {formStep + 1} of {totalSteps}</p>
      </div>
    );
  };

  // Render success message after submission
  if (formSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">All Set!</h2>
          <p className="text-gray-600 mb-6">
            Thanks {formData.preferredName}! Your preferences have been saved.
            We're personalizing your experience now.
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirecting you in a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8faaf1] via-[#6488e9] to-[#3c5bbd] p-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <img src="/Embrace Spectrum Black.png" alt="Embrace Spectrum" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Embrace Spectrum</h1>
          <p className="text-gray-600">Let's personalize your experience</p>
        </div>
        
        {renderProgressBar()}
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {formStep === 0 && (
            <div className="space-y-6">
              <div className="mb-6">
                <label htmlFor="preferredName" className="block text-gray-700 font-medium mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  id="preferredName"
                  name="preferredName"
                  value={formData.preferredName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="ageGroup" className="block text-gray-700 font-medium mb-2">
                  Pick your age group
                </label>
                <select
                  id="ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>Select your age group</option>
                  {ageGroups.map((age, index) => (
                    <option key={index} value={age}>{age}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                  I am a...
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>Select your role</option>
                  {roles.map((role, index) => (
                    <option key={index} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Neurodiversity and Sensory Preferences */}
          {formStep === 1 && (
            <div className="space-y-6">
              <div className="mb-6">
                <p className="block text-gray-700 font-medium mb-2">
                  How do you identify? (optional)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {neurodiversityTypes.map((type, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`neurodiversity-${index}`}
                        value={type}
                        checked={formData.neurodiversityTypes.includes(type)}
                        onChange={(e) => handleMultiSelectChange(e, 'neurodiversityTypes')}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`neurodiversity-${index}`} className="ml-2 text-gray-700">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
                
                {formData.neurodiversityTypes.includes('Other') && (
                  <div className="mt-3 flex items-center">
                    <input
                      type="text"
                      value={customNeurodiversity}
                      onChange={(e) => setCustomNeurodiversity(e.target.value)}
                      placeholder="Enter your neurodiversity type"
                      className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustom('neurodiversityTypes', customNeurodiversity, setCustomNeurodiversity)}
                      className="ml-2 bg-blue-600 text-white p-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <p className="block text-gray-700 font-medium mb-2">
                  Choose what helps you focus
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {sensoryPreferences.map((pref, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`sensory-${index}`}
                        value={pref}
                        checked={formData.sensoryPreferences.includes(pref)}
                        onChange={(e) => handleMultiSelectChange(e, 'sensoryPreferences')}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`sensory-${index}`} className="ml-2 text-gray-700">
                        {pref}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Communication and Goals */}
          {formStep === 2 && (
            <div className="space-y-6">
              <div className="mb-6">
                <label htmlFor="communicationStyle" className="block text-gray-700 font-medium mb-2">
                  How do you prefer to learn?
                </label>
                <select
                  id="communicationStyle"
                  name="communicationStyle"
                  value={formData.communicationStyle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>Select your learning style</option>
                  {communicationStyles.map((style, index) => (
                    <option key={index} value={style}>{style}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <p className="block text-gray-700 font-medium mb-2">
                  What brings you here today?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {mainGoalOptions.map((goal, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`goal-${index}`}
                        value={goal}
                        checked={formData.mainGoals.includes(goal)}
                        onChange={(e) => handleMultiSelectChange(e, 'mainGoals')}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`goal-${index}`} className="ml-2 text-gray-700">
                        {goal}
                      </label>
                    </div>
                  ))}
                </div>
                
                {formData.mainGoals.includes('Other') && (
                  <div className="mt-3 flex items-center">
                    <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="Enter your goal"
                      className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustom('mainGoals', customGoal, setCustomGoal)}
                      className="ml-2 bg-blue-600 text-white p-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Support Context and Completion */}
          {formStep === 3 && (
            <div className="space-y-6">
              <div className="mb-6">
                <label htmlFor="supportContext" className="block text-gray-700 font-medium mb-2">
                  Are you using this with help?
                </label>
                <select
                  id="supportContext"
                  name="supportContext"
                  value={formData.supportContext}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>Select option</option>
                  {supportContexts.map((context, index) => (
                    <option key={index} value={context}>{context}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Before you finish</h3>
                <p className="text-blue-700">
                  You can always update these preferences later in your profile settings.
                  We use this information to personalize your experience, not to limit it.
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition"
                >
                  Complete Setup
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;