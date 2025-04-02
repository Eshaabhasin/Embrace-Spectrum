import React, { useState } from 'react';
import NavBar from '../NavBar/NavBar';

const NeurodiversityJobPortal = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      accommodationsNeeded: '',
      neurodiversityType: '',
      workEnvironmentPreferences: '',
    },
    educationInfo: {
      highestEducation: '',
      fieldOfStudy: '',
      institutions: '',
      certifications: '',
      completionYears: '',
    },
    professionalInfo: {
      yearsOfExperience: '',
      skills: '',
      strengths: '',
      previousRoles: '',
      preferredIndustries: '',
      preferredWorkArrangement: '',
    },
    resume: null,
    jobPreferences: {
      remoteWork: false,
      flexibleHours: false,
      quietWorkspace: false,
      structuredEnvironment: false,
      visualAids: false,
      writtenInstructions: false,
      mentorSupport: false,
    }
  });
  
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        resume: file
      });
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const getRecommendations = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockRecommendations = [
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
      ];
      
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 2000);
  };

  const renderPersonalInfoForm = () => (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-6">Personal Information</h2>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Full Name</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded-md" 
          value={formData.personalInfo.name}
          onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Email Address</label>
        <input 
          type="email" 
          className="w-full p-2 border rounded-md" 
          value={formData.personalInfo.email}
          onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Phone Number</label>
        <input 
          type="tel" 
          className="w-full p-2 border rounded-md" 
          value={formData.personalInfo.phone}
          onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Location</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded-md" 
          value={formData.personalInfo.location}
          onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Neurodiversity Type (Optional)</label>
        <select 
          className="w-full p-2 border rounded-md"
          value={formData.personalInfo.neurodiversityType}
          onChange={(e) => handleInputChange('personalInfo', 'neurodiversityType', e.target.value)}
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
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Work Environment Preferences</label>
        <textarea 
          className="w-full p-2 border rounded-md h-24" 
          placeholder="Describe your ideal work environment (noise level, lighting, desk setup, schedule flexibility, etc.)"
          value={formData.personalInfo.workEnvironmentPreferences}
          onChange={(e) => handleInputChange('personalInfo', 'workEnvironmentPreferences', e.target.value)}
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Accommodations Needed (Optional)</label>
        <textarea 
          className="w-full p-2 border rounded-md h-24" 
          placeholder="Describe any accommodations that help you work at your best"
          value={formData.personalInfo.accommodationsNeeded}
          onChange={(e) => handleInputChange('personalInfo', 'accommodationsNeeded', e.target.value)}
        ></textarea>
      </div>
      
      <div className="flex justify-end">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={nextStep}
        >
          Next: Education
        </button>
      </div>
    </div>
  );

  const renderEducationForm = () => (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-6">Education Information</h2>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Highest Education Level</label>
        <select 
          className="w-full p-2 border rounded-md"
          value={formData.educationInfo.highestEducation}
          onChange={(e) => handleInputChange('educationInfo', 'highestEducation', e.target.value)}
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
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Field of Study</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded-md" 
          value={formData.educationInfo.fieldOfStudy}
          onChange={(e) => handleInputChange('educationInfo', 'fieldOfStudy', e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Educational Institutions</label>
        <textarea 
          className="w-full p-2 border rounded-md h-24" 
          placeholder="List schools, colleges, universities you've attended"
          value={formData.educationInfo.institutions}
          onChange={(e) => handleInputChange('educationInfo', 'institutions', e.target.value)}
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Certifications & Additional Training</label>
        <textarea 
          className="w-full p-2 border rounded-md h-24" 
          placeholder="List any relevant certifications or additional training"
          value={formData.educationInfo.certifications}
          onChange={(e) => handleInputChange('educationInfo', 'certifications', e.target.value)}
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Completion Years</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded-md" 
          placeholder="e.g., 2018, 2020-2022"
          value={formData.educationInfo.completionYears}
          onChange={(e) => handleInputChange('educationInfo', 'completionYears', e.target.value)}
        />
      </div>
      
      <div className="flex justify-between">
        <button 
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          onClick={prevStep}
        >
          Back
        </button>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={nextStep}
        >
          Next: Professional Experience
        </button>
      </div>
    </div>
  );

  const renderProfessionalForm = () => (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-6">Professional Experience</h2>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Years of Experience</label>
        <select 
          className="w-full p-2 border rounded-md"
          value={formData.professionalInfo.yearsOfExperience}
          onChange={(e) => handleInputChange('professionalInfo', 'yearsOfExperience', e.target.value)}
        >
          <option value="">Select one</option>
          <option value="entry">Entry Level (0-2 years)</option>
          <option value="mid">Mid Level (3-5 years)</option>
          <option value="senior">Senior Level (6-10 years)</option>
          <option value="expert">Expert Level (10+ years)</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Core Skills</label>
        <textarea 
          className="w-full p-2 border rounded-md h-24" 
          placeholder="List your technical and professional skills"
          value={formData.professionalInfo.skills}
          onChange={(e) => handleInputChange('professionalInfo', 'skills', e.target.value)}
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Your Strengths</label>
        <textarea 
          className="w-full p-2 border rounded-md h-24" 
          placeholder="Describe your unique strengths that might come from your neurodiversity"
          value={formData.professionalInfo.strengths}
          onChange={(e) => handleInputChange('professionalInfo', 'strengths', e.target.value)}
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Previous Roles</label>
        <textarea 
          className="w-full p-2 border rounded-md h-24" 
          placeholder="List your previous job titles and brief descriptions"
          value={formData.professionalInfo.previousRoles}
          onChange={(e) => handleInputChange('professionalInfo', 'previousRoles', e.target.value)}
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Preferred Industries</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded-md" 
          placeholder="e.g., Technology, Healthcare, Education"
          value={formData.professionalInfo.preferredIndustries}
          onChange={(e) => handleInputChange('professionalInfo', 'preferredIndustries', e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Preferred Work Arrangement</label>
        <select 
          className="w-full p-2 border rounded-md"
          value={formData.professionalInfo.preferredWorkArrangement}
          onChange={(e) => handleInputChange('professionalInfo', 'preferredWorkArrangement', e.target.value)}
        >
          <option value="">Select one</option>
          <option value="remote">Fully Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>
      
      <div className="flex justify-between">
        <button 
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          onClick={prevStep}
        >
          Back
        </button>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={nextStep}
        >
          Next: Resume & Preferences
        </button>
      </div>
    </div>
  );

  const renderResumeAndPreferences = () => (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-6">Resume Upload & Job Preferences</h2>
      
      <div className="mb-6">
        <label className="block font-medium mb-1">Upload Resume (Optional)</label>
        <input 
          type="file" 
          className="w-full p-2 border rounded-md" 
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX</p>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-3">Workplace Accommodations</h3>
        <p className="text-sm text-gray-600 mb-3">Select the accommodations that would help you thrive:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
      </div>
      
      <div className="flex justify-between">
        <button 
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          onClick={prevStep}
        >
          Back
        </button>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => {
            getRecommendations();
            nextStep();
          }}
        >
          Find Matching Jobs
        </button>
      </div>
    </div>
  );

  const renderJobRecommendations = () => (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-6">Recommended Jobs for You</h2>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Finding personalized job matches...</p>
        </div>
      ) : (
        <>
          <p className="mb-6 text-gray-600">
            Based on your profile and preferences, we found these jobs that might be a good fit:
          </p>
          
          <div className="space-y-6">
            {recommendations.map(job => (
              <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold">{job.title}</h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">{job.match}</span>
                </div>
                
                <p className="text-gray-700 mt-1">{job.company} • {job.location}</p>
                
                <p className="mt-3">{job.description}</p>
                
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Accommodations offered:</p>
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
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Apply Now
                  </button>
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between">
            <button 
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={prevStep}
            >
              Back to Preferences
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => setStep(1)}
            >
              Start New Search
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="w-8xl px-20 p-4 py-10">
      <header className="mb-8 flex">
        <a href="/Home" className="flex items-center justify-center w-10 h-10 border-1 border-black rounded-full text-black hover:bg-blue-100 transition">
          ←
        </a>
        <div className='ml-5'>
        <h1 className="text-5xl font-bold mb-2">NeuroTalent</h1>
        <p className="text-gray-600">Connecting neurodivergent talent with inclusive employers</p>
        </div>
      </header>
      
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div 
              key={stepNumber}
              className={`z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {stepNumber}
            </div>
          ))}
          
          <div className="absolute top-5 h-1 w-full bg-gray-200 -z-10"></div>
          <div 
            className="absolute top-5 h-1 bg-blue-600 -z-5 transition-all"
            style={{ width: `${(step - 1) * 25}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Personal</span>
          <span>Education</span>
          <span>Professional</span>
          <span>Preferences</span>
          <span>Jobs</span>
        </div>
      </div>
      
      {step === 1 && renderPersonalInfoForm()}
      {step === 2 && renderEducationForm()}
      {step === 3 && renderProfessionalForm()}
      {step === 4 && renderResumeAndPreferences()}
      {step === 5 && renderJobRecommendations()}
    </div>
  );
};

export default NeurodiversityJobPortal;