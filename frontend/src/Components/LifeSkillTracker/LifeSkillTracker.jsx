import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
} from 'firebase/firestore';
import { Star, Award, CheckCircle, Circle, Trophy, Zap, RefreshCw, Brain } from 'lucide-react';

import { db } from '../../../firebase';

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const LifeSkillsTracker = () => {
  const { user, isLoaded } = useUser();
  const [onboardingData, setOnboardingData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userProgress, setUserProgress] = useState({
    xp: 0,
    level: 1,
    badges: [],
    completedTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [tasksGenerated, setTasksGenerated] = useState(false);

  // Badge definitions
  const badgeDefinitions = [
    { id: 'first-steps', name: 'First Steps', description: 'Complete your first task', xpRequired: 10, icon: '🎯' },
    { id: 'communicator', name: 'Communicator', description: 'Complete 3 communication tasks', xpRequired: 50, icon: '🗣️' },
    { id: 'routine-master', name: 'Routine Master', description: 'Complete 3 daily living tasks', xpRequired: 75, icon: '📅' },
    { id: 'brain-trainer', name: 'Brain Trainer', description: 'Complete 5 cognitive tasks', xpRequired: 100, icon: '🧠' },
    { id: 'level-up', name: 'Level Up!', description: 'Reach level 2', xpRequired: 100, icon: '⬆️' },
    { id: 'xp-collector', name: 'XP Collector', description: 'Earn 200 XP', xpRequired: 200, icon: '💎' },
    { id: 'task-master', name: 'Task Master', description: 'Complete 10 tasks', xpRequired: 250, icon: '🏆' }
  ];

  // Monitor Clerk authentication state and fetch data
  useEffect(() => {
    if (isLoaded && user) {
      console.log('Clerk user detected:', user.id);
      loadUserData();
    } else if (isLoaded && !user) {
      console.log('No user signed in with Clerk');
      setOnboardingData(null);
      setLoading(false);
    }
  }, [isLoaded, user]);

  // Fixed fetchOnboardingData function with error handling
  const fetchOnboardingData = async (userId) => {
    try {
      console.log('Fetching data for user:', userId);
      
      const docRef = doc(db, 'onboardingData', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Onboarding data found:', data);
        
        if (data.preferredName || data.mainGoals || data.neurodiversityTypes) {
          setOnboardingData(data);
          console.log('Data structure matches expected format');
        } else {
          console.log('Data found but structure unexpected:', Object.keys(data));
          setOnboardingData(data);
        }
      } else {
        console.log('No onboarding document found for user:', userId);
        setOnboardingData(null);
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      setOnboardingData(null);
    }
  };

  // Enhanced loadUserData with better error handling
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load onboarding data
      await fetchOnboardingData(user.id);
      
      try {
        // Load user progress
        const progressDoc = await getDoc(doc(db, 'userProgress', user.id));
        if (progressDoc.exists()) {
          const progressData = progressDoc.data();
          console.log('Existing progress loaded:', progressData);
          setUserProgress(progressData);
        } else {
          // Initialize progress if it doesn't exist
          console.log('No existing progress found, creating initial progress');
          const initialProgress = {
            xp: 0,
            level: 1,
            badges: [],
            completedTasks: [],
            userId: user.id,
            createdAt: new Date().toISOString()
          };
          
          try {
            // Save initial progress to Firebase
            await setDoc(doc(db, 'userProgress', user.id), initialProgress);
            console.log('Initial progress saved to Firebase');
          } catch (saveError) {
            console.error('Error saving initial progress to Firebase:', saveError);
            // Continue with local state even if Firebase save fails
          }
          
          setUserProgress(initialProgress);
        }
      } catch (firebaseError) {
        console.error('Firebase error loading user progress:', firebaseError);
        // Continue with default progress even if Firebase access fails
        const initialProgress = {
          xp: 0,
          level: 1,
          badges: [],
          completedTasks: [],
          userId: user.id,
          createdAt: new Date().toISOString()
        };
        setUserProgress(initialProgress);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely convert values to arrays
  const safeArrayConvert = (value, fallback = 'Not specified') => {
    if (!value) return fallback;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string') return value;
    return fallback;
  };

  // Task generation prompt with proper null checking
  const createTaskGenerationPrompt = (userData) => {
    const preferredName = userData?.preferredName || user?.firstName || 'Friend';
    const ageGroup = userData?.ageGroup || 'Not specified';
    const role = userData?.role || 'Not specified';
    const mainGoals = safeArrayConvert(userData?.mainGoals);
    const neurodiversityTypes = safeArrayConvert(userData?.neurodiversityTypes);
    const communicationStyle = userData?.communicationStyle || 'Not specified';
    const sensoryPreferences = safeArrayConvert(userData?.sensoryPreferences);

    return `You are a compassionate life skills coach for neurodivergent individuals. Generate exactly 6 personalized daily life skills tasks based on this user profile:

    User Profile:
    - Name: ${preferredName}
    - Age Group: ${ageGroup}
    - Role: ${role}
    - Main Goals: ${mainGoals}
    - Neurodiversity Types: ${neurodiversityTypes}
    - Communication Style: ${communicationStyle}
    - Sensory Preferences: ${sensoryPreferences}

    CRITICAL REQUIREMENTS:
    1. Generate exactly 6 tasks that are practical, achievable, and relevant to their daily life
    2. Tasks should help build life skills that make daily living easier and more manageable
    3. Consider their neurodiversity type and sensory preferences when creating tasks
    4. Each task should be clear, specific, and not overwhelming
    5. Include a mix of different skill areas: communication, daily living, self-care, organization, social skills, and cognitive skills

    RESPONSE FORMAT - Return ONLY a valid JSON array with this exact structure:
    [
      {
        "id": "task-1",
        "title": "Clear, specific task description",
        "category": "Communication|Daily Living|Self-Care|Organization|Social|Cognitive",
        "xp": 10-40,
        "difficulty": "easy|medium|hard",
        "description": "Brief explanation of why this task is helpful"
      }
    ]

    EXAMPLES of good tasks:
    - "Set up a visual morning routine checklist with pictures"
    - "Practice one new conversation starter this week"
    - "Create a quiet space in your room for sensory breaks"
    - "Organize one drawer using labels and containers"
    - "Write down three things you accomplished today"
    - "Practice deep breathing for 5 minutes when feeling overwhelmed"

    Remember: Tasks should be empowering, achievable, and tailored to their specific needs and goals. No generic tasks - make them personal and meaningful.`;
  };

  // Generate tasks using Gemini AI
  const generatePersonalizedTasks = async () => {
    if (!onboardingData) {
      console.log('No onboarding data available for task generation');
      return;
    }

    setGeneratingTasks(true);
    console.log('Generating personalized tasks with Gemini...');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: createTaskGenerationPrompt(onboardingData) }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        console.log('Generated text:', generatedText);
        
        // Extract JSON from the response
        const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const tasksJson = JSON.parse(jsonMatch[0]);
          console.log('Parsed tasks:', tasksJson);
          setTasks(tasksJson);
          setTasksGenerated(true);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      // Fallback to default tasks if API fails
      setTasks(getDefaultTasks());
      setTasksGenerated(true);
    } finally {
      setGeneratingTasks(false);
    }
  };

  // Fallback default tasks
  const getDefaultTasks = () => {
    return [
      { id: 'default-1', title: 'Take a 10-minute mindful walk', category: 'Self-Care', xp: 15, difficulty: 'easy', description: 'Fresh air and movement help regulate emotions' },
      { id: 'default-2', title: 'Organize one small area of your space', category: 'Organization', xp: 20, difficulty: 'medium', description: 'A tidy space can reduce overwhelm' },
      { id: 'default-3', title: 'Practice saying "thank you" to someone', category: 'Social', xp: 12, difficulty: 'easy', description: 'Small social connections matter' },
      { id: 'default-4', title: 'Write down 3 things you accomplished today', category: 'Self-Care', xp: 18, difficulty: 'easy', description: 'Celebrating progress builds confidence' },
      { id: 'default-5', title: 'Create a simple daily schedule', category: 'Organization', xp: 25, difficulty: 'medium', description: 'Structure helps reduce anxiety' },
      { id: 'default-6', title: 'Practice deep breathing for 5 minutes', category: 'Self-Care', xp: 10, difficulty: 'easy', description: 'Breathing exercises calm the nervous system' }
    ];
  };

  // Enhanced completeTask with better error handling
  const completeTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task || userProgress.completedTasks.includes(taskId)) return;
      
      const newXp = userProgress.xp + task.xp;
      const newLevel = Math.floor(newXp / 100) + 1;
      const newCompletedTasks = [...userProgress.completedTasks, taskId];
      
      // Check for new badges
      const newBadges = [...userProgress.badges];
      badgeDefinitions.forEach(badge => {
        if (newXp >= badge.xpRequired && !newBadges.find(b => b.id === badge.id)) {
          newBadges.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            earnedAt: new Date().toISOString()
          });
        }
      });
      
      // Update local state first
      const updatedProgress = {
        ...userProgress,
        xp: newXp,
        level: newLevel,
        badges: newBadges,
        completedTasks: newCompletedTasks,
        updatedAt: new Date().toISOString()
      };
      setUserProgress(updatedProgress);
      
      try {
        // Try to update Firebase but don't block UI if it fails
        await updateDoc(doc(db, 'userProgress', user.id), updatedProgress);
        console.log('Progress updated in Firebase:', updatedProgress);
      } catch (firebaseError) {
        console.error('Firebase error updating progress:', firebaseError);
        // Continue with local state even if Firebase update fails
      }
      
      // Show badge notification if new badge earned
      if (newBadges.length > userProgress.badges.length) {
        const latestBadge = newBadges[newBadges.length - 1];
        showBadgeNotification(latestBadge);
      }
      
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const showBadgeNotification = (badge) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-400 text-black p-4 rounded-lg shadow-lg z-50 animate-bounce';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-2xl">${badge.icon}</span>
        <div>
          <p class="font-bold">New Badge Earned!</p>
          <p class="text-sm">${badge.name}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-700 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'hard': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Communication': 'text-blue-700 bg-blue-100 border-blue-200',
      'Daily Living': 'text-purple-700 bg-purple-100 border-purple-200',
      'Cognitive': 'text-indigo-700 bg-indigo-100 border-indigo-200',
      'Self-Development': 'text-pink-700 bg-pink-100 border-pink-200',
      'Self-Care': 'text-green-700 bg-green-100 border-green-200',
      'Organization': 'text-orange-700 bg-orange-100 border-orange-200',
      'Social': 'text-cyan-700 bg-cyan-100 border-cyan-200',
      'Academic': 'text-teal-700 bg-teal-100 border-teal-200',
      'Health': 'text-emerald-700 bg-emerald-100 border-emerald-200',
      'Wellness': 'text-sky-700 bg-sky-100 border-sky-200'
    };
    return colors[category] || 'text-gray-700 bg-gray-100 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg text-gray-700 font-medium">Loading your personalized experience...</p>
          <p className="text-sm text-gray-500">Setting up your wellness journey</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-gray-800">Welcome to LifeSkills Tracker</h2>
          <p className="text-gray-600">Please sign in to access your personalized journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-8xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-3xl mt-20 shadow-lg p-6 lg:p-8 space-y-6 border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {onboardingData?.preferredName || user.firstName}! 🌟
              </h1>
              <p className="text-lg text-gray-600">
                Keep building your skills, one task at a time
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center w-full md:w-auto">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 flex justify-center items-center mb-1">
                  <Zap className="w-6 h-6 mr-2" />
                  {userProgress.xp}
                </div>
                <p className="text-sm text-blue-700 font-medium">XP Points</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 flex justify-center items-center mb-1">
                  <Star className="w-6 h-6 mr-2" />
                  {userProgress.level}
                </div>
                <p className="text-sm text-purple-700 font-medium">Level</p>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600 flex justify-center items-center mb-1">
                  <Award className="w-6 h-6 mr-2" />
                  {userProgress.badges.length}
                </div>
                <p className="text-sm text-yellow-700 font-medium">Badges</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span className="font-medium">Level {userProgress.level} Progress</span>
              <span className="font-medium">{100 - (userProgress.xp % 100)} XP to next level</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 border border-gray-300">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(userProgress.xp % 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Generate Tasks Button */}
          {!tasksGenerated && onboardingData && (
            <div className="text-center">
              <button
                onClick={generatePersonalizedTasks}
                disabled={generatingTasks}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 mx-auto"
              >
                {generatingTasks ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Your Personal Tasks...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Generate My Personal Tasks with AI</span>
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-3">
                AI will create 6 personalized tasks based on your profile
              </p>
            </div>
          )}
        </div>

        {userProgress.badges.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-lg p-6 lg:p-8 border border-yellow-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <Trophy className="w-7 h-7 mr-3 text-yellow-500" />
                      Your Achievement Badges
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {userProgress.badges.map((badge) => (
                        <div key={badge.id} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 hover:border-yellow-300 transition-colors">
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <p className="font-bold text-sm text-gray-800 mb-1">{badge.name}</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{badge.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
        
                {/* Tasks Grid */}
                {tasks.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl"> 
                    <div className="flex justify-between items-center mb-5">
                      <h2 className="text-2xl font-bold text-gray-800">Your Personal Tasks</h2>
                      {tasksGenerated && (
                        <button
                          onClick={() => {
                            setTasksGenerated(false);
                            setTasks([]);
                            generatePersonalizedTasks();
                          }}
                          className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Generate New Tasks</span>
                        </button>
                      )}
                    </div>
        
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tasks.map((task) => {
                        const isCompleted = userProgress.completedTasks.includes(task.id);
                        return (
                          <div
                            key={task.id}
                            className={`bg-white rounded-3xl p-6 shadow-lg transition-all duration-300 space-y-4 border-2 ${
                              isCompleted 
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-100' 
                                : 'hover:bg-blue-50 border-gray-200 hover:border-blue-200 hover:shadow-xl hover:scale-102'
                            }`}
                          >
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <div className="flex flex-wrap gap-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(task.category)}`}>
                                  {task.category}
                                </span>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(task.difficulty)}`}>
                                  {task.difficulty}
                                </span>
                              </div>
                              <div className="flex items-center text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                <Zap className="w-4 h-4 mr-1" />
                                +{task.xp}
                              </div>
                            </div>
        
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight">{task.title}</h3>
                              {task.description && (
                                <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
                              )}
                            </div>
        
                            <button
                              onClick={() => completeTask(task.id)}
                              disabled={isCompleted}
                              className={`w-full py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center text-sm ${
                                isCompleted
                                  ? 'bg-green-100 text-green-800 cursor-not-allowed border-2 border-green-200'
                                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                              }`}
                            >
                              {isCompleted ? (
                                <>
                                  <CheckCircle className="w-5 h-5 mr-2" />
                                  Task Completed! 🎉
                                </>
                              ) : (
                                <>
                                  <Circle className="w-5 h-5 mr-2" />
                                  Mark as Complete
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
        
                {/* No onboarding data message */}
                {!onboardingData && (
                  <div className="bg-white rounded-3xl shadow-lg p-8 text-center border border-blue-100">
                    <div className="text-6xl mb-4">📝</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Profile First</h2>
                    <p className="text-gray-600 leading-relaxed">
                      To get personalized life skills tasks, please complete your onboarding profile. 
                      This helps us create tasks that are perfect for your unique needs and goals.
                    </p>
                    <button className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl transition-all transform hover:scale-105">
                      Complete Profile
                    </button>
                  </div>
                )}
        
                {/* Stats Footer */}
                {tasks.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-lg p-6 lg:p-8 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Your Progress Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                        <p className="text-3xl font-bold text-blue-600 mb-2">{userProgress.completedTasks.length}</p>
                        <p className="text-blue-700 text-sm font-medium">Tasks Completed</p>
                      </div>
                      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                        <p className="text-3xl font-bold text-purple-600 mb-2">{tasks.length - userProgress.completedTasks.length}</p>
                        <p className="text-purple-700 text-sm font-medium">Tasks Remaining</p>
                      </div>
                      <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                        <p className="text-3xl font-bold text-green-600 mb-2">
                          {tasks.length > 0 ? Math.round((userProgress.completedTasks.length / tasks.length) * 100) : 0}%
                        </p>
                        <p className="text-green-700 text-sm font-medium">Overall Progress</p>
                      </div>
                      <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                        <p className="text-3xl font-bold text-yellow-600 mb-2">{userProgress.badges.length}</p>
                        <p className="text-yellow-700 text-sm font-medium">Badges Earned</p>
                      </div>
                    </div>
                  </div>
                )}
      </div>
    </div>
  );
};

export default LifeSkillsTracker;