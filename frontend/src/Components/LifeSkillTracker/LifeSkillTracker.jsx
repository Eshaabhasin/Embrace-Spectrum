import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { generatePersonalizedTasks } from '../Services/firebaseservice';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  increment,
  arrayUnion 
} from 'firebase/firestore';
import { Star, Award, CheckCircle, Circle, Trophy, Zap } from 'lucide-react';

// Simulated firebase config (replace with your actual config)
import { db } from '../../../firebase';

const LifeSkillsTracker = () => {
  const { user, isSignedIn } = useUser();
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userProgress, setUserProgress] = useState({
    xp: 0,
    level: 1,
    badges: [],
    completedTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);

  // Pre-defined task templates based on onboarding data
  const taskTemplates = {
    'Improve speaking': [
      { id: 'speak-1', title: 'Practice saying "Hello" 5 times', category: 'Communication', xp: 10, difficulty: 'easy' },
      { id: 'speak-2', title: 'Record yourself reading a short story', category: 'Communication', xp: 20, difficulty: 'medium' },
      { id: 'speak-3', title: 'Have a 5-minute conversation with someone', category: 'Communication', xp: 30, difficulty: 'hard' }
    ],
    'Learn routines': [
      { id: 'routine-1', title: 'Create a morning routine checklist', category: 'Daily Living', xp: 15, difficulty: 'easy' },
      { id: 'routine-2', title: 'Follow your routine for 3 days', category: 'Daily Living', xp: 25, difficulty: 'medium' },
      { id: 'routine-3', title: 'Teach someone else your routine', category: 'Daily Living', xp: 35, difficulty: 'hard' }
    ],
    'Play learning games': [
      { id: 'game-1', title: 'Complete a puzzle game', category: 'Cognitive', xp: 12, difficulty: 'easy' },
      { id: 'game-2', title: 'Play a memory matching game', category: 'Cognitive', xp: 18, difficulty: 'medium' },
      { id: 'game-3', title: 'Solve a logic problem', category: 'Cognitive', xp: 28, difficulty: 'hard' }
    ],
    'Coaching': [
      { id: 'coach-1', title: 'Set a personal goal', category: 'Self-Development', xp: 20, difficulty: 'easy' },
      { id: 'coach-2', title: 'Track progress for one week', category: 'Self-Development', xp: 30, difficulty: 'medium' },
      { id: 'coach-3', title: 'Reflect on your achievements', category: 'Self-Development', xp: 40, difficulty: 'hard' }
    ]
  };

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

  useEffect(() => {
    if (isSignedIn && user) {
      loadUserData();
    }
  }, [isSignedIn, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load onboarding data
      const onboardingDoc = await getDoc(doc(db, 'onboardingData', user.uid));
      if (onboardingDoc.exists()) {
        const onboardingData = onboardingDoc.data();
        setUserData(onboardingData);
        
        const generatedTasks = generatePersonalizedTasks(onboardingData);
        setTasks(generatedTasks);
      }
      
      // Load user progress
     const progressDoc = await getDoc(doc(db, 'userProgress', user.uid));
      if (progressDoc.exists()) {
        setUserProgress(progressDoc.data());
      } else {
        // Initialize progress if it doesn't exist
        const initialProgress = {
          xp: 0,
          level: 1,
          badges: [],
          completedTasks: [],
          userId: user.uid,
          createdAt: new Date().toISOString()
        };
      await setDoc(doc(db, 'userProgress', user.uid), initialProgress);
        setUserProgress(initialProgress);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTasksFromOnboarding = (onboardingData) => {
    const { mainGoals = [], role, ageGroup } = onboardingData;
    let generatedTasks = [];
    
    // Generate tasks based on main goals
    mainGoals.forEach(goal => {
      if (taskTemplates[goal]) {
        generatedTasks = [...generatedTasks, ...taskTemplates[goal]];
      }
    });
    
    // Add role-specific tasks
    if (role === 'Student') {
      generatedTasks.push(
        { id: 'student-1', title: 'Organize your study space', category: 'Academic', xp: 15, difficulty: 'easy' },
        { id: 'student-2', title: 'Complete homework on time', category: 'Academic', xp: 25, difficulty: 'medium' }
      );
    }
    
    // Add age-appropriate tasks
    if (ageGroup === '13–17' || ageGroup === '18–25') {
      generatedTasks.push(
        { id: 'social-1', title: 'Make plans with a friend', category: 'Social', xp: 20, difficulty: 'medium' },
        { id: 'social-2', title: 'Practice active listening', category: 'Social', xp: 18, difficulty: 'easy' }
      );
    }
    
    // Ensure we have at least some default tasks
    if (generatedTasks.length === 0) {
      generatedTasks = [
        { id: 'default-1', title: 'Take a 10-minute walk', category: 'Health', xp: 10, difficulty: 'easy' },
        { id: 'default-2', title: 'Write in a journal', category: 'Self-Development', xp: 15, difficulty: 'easy' },
        { id: 'default-3', title: 'Practice deep breathing', category: 'Wellness', xp: 12, difficulty: 'easy' }
      ];
    }
    
    setTasks(generatedTasks.slice(0, 12)); // Limit to 12 tasks initially
  };

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
      
      // Update local state
      const updatedProgress = {
        ...userProgress,
        xp: newXp,
        level: newLevel,
        badges: newBadges,
        completedTasks: newCompletedTasks
      };
      setUserProgress(updatedProgress);
      
      // Update Firebase
     await updateDoc(doc(db, 'userProgress', user.uid), {
        xp: newXp,
        level: newLevel,
        badges: newBadges,
        completedTasks: newCompletedTasks,
        updatedAt: new Date().toISOString()
      });
      
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
    // Create a temporary notification element
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
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Communication': 'text-blue-600 bg-blue-100',
      'Daily Living': 'text-purple-600 bg-purple-100',
      'Cognitive': 'text-indigo-600 bg-indigo-100',
      'Self-Development': 'text-pink-600 bg-pink-100',
      'Academic': 'text-teal-600 bg-teal-100',
      'Social': 'text-orange-600 bg-orange-100',
      'Health': 'text-green-600 bg-green-100',
      'Wellness': 'text-cyan-600 bg-cyan-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your personalized experience...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access your LifeSkills Tracker</p>
        </div>
      </div>
    );
  }

return (
  <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-6 lg:p-10">
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 lg:p-8 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              Welcome back, {userData?.preferredName || user.firstName}! 🌟
            </h1>
            <p className="text-base text-gray-600 mt-1">
              Keep building your skills, one task at a time
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center w-full md:w-auto">
            <div>
              <div className="text-xl font-bold text-blue-600 flex justify-center items-center">
                <Zap className="w-5 h-5 mr-1" />
                {userProgress.xp}
              </div>
              <p className="text-sm text-gray-500">XP</p>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600 flex justify-center items-center">
                <Star className="w-5 h-5 mr-1" />
                {userProgress.level}
              </div>
              <p className="text-sm text-gray-500">Level</p>
            </div>
            <div>
              <div className="text-xl font-bold text-yellow-600 flex justify-center items-center">
                <Award className="w-5 h-5 mr-1" />
                {userProgress.badges.length}
              </div>
              <p className="text-sm text-gray-500">Badges</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Level {userProgress.level}</span>
            <span>{100 - (userProgress.xp % 100)} XP to next level</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(userProgress.xp % 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {userProgress.badges.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Your Badges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userProgress.badges.map((badge) => (
              <div key={badge.id} className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="font-medium text-sm text-gray-800">{badge.name}</p>
                <p className="text-xs text-gray-600">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => {
          const isCompleted = userProgress.completedTasks.includes(task.id);
          return (
            <div
              key={task.id}
              className={`bg-white rounded-2xl p-6 shadow transition-all duration-200 space-y-4 ${
                isCompleted ? 'bg-green-50 border border-green-200' : 'hover:bg-blue-50'
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${getDifficultyColor(task.difficulty)}`}>
                    {task.difficulty}
                  </span>
                </div>
                <div className="flex items-center text-blue-600 font-medium text-sm">
                  <Zap className="w-4 h-4 mr-1" />
                  +{task.xp}
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 text-lg">{task.title}</h3>

              <button
                onClick={() => completeTask(task.id)}
                disabled={isCompleted}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="w-5 h-5 mr-2" />
                    Mark as Done
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="bg-white rounded-2xl shadow p-6 lg:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{userProgress.completedTasks.length}</p>
            <p className="text-gray-600 text-sm">Tasks Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{tasks.length - userProgress.completedTasks.length}</p>
            <p className="text-gray-600 text-sm">Tasks Remaining</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {tasks.length > 0 ? Math.round((userProgress.completedTasks.length / tasks.length) * 100) : 0}%
            </p>
            <p className="text-gray-600 text-sm">Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{userProgress.badges.length}</p>
            <p className="text-gray-600 text-sm">Badges Earned</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

export default LifeSkillsTracker;