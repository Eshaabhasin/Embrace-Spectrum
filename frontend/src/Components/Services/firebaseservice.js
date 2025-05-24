// src/services/firebaseServices.js
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
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../firebase';

// User Onboarding Services
export const saveOnboardingData = async (userId, onboardingData) => {
  try {
    const userDoc = doc(db, 'onboardingData', userId);
    await setDoc(userDoc, {
      ...onboardingData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    throw error;
  }
};

export const getOnboardingData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'onboardingData', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    throw error;
  }
};

// User Progress Services
export const initializeUserProgress = async (userId) => {
  try {
    const progressDoc = doc(db, 'userProgress', userId);
    const initialProgress = {
      userId,
      xp: 0,
      level: 1,
      badges: [],
      completedTasks: [],
      streakDays: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(progressDoc, initialProgress);
    return initialProgress;
  } catch (error) {
    console.error('Error initializing user progress:', error);
    throw error;
  }
};

export const getUserProgress = async (userId) => {
  try {
    const progressDoc = await getDoc(doc(db, 'userProgress', userId));
    if (progressDoc.exists()) {
      return progressDoc.data();
    } else {
      // Initialize if doesn't exist
      return await initializeUserProgress(userId);
    }
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

export const updateUserProgress = async (userId, progressData) => {
  try {
    const progressDoc = doc(db, 'userProgress', userId);
    await updateDoc(progressDoc, {
      ...progressData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

// Task Management Services
export const generatePersonalizedTasks = (onboardingData) => {
  const { mainGoals = [], role, ageGroup, neurodiversityTypes = [], sensoryPreferences = [] } = onboardingData;
  
  const taskTemplates = {
    'Improve speaking': [
      { 
        id: 'speak-1', 
        title: 'Practice saying "Hello" to 5 different people', 
        description: 'Start small by greeting people you meet today',
        category: 'Communication', 
        xp: 10, 
        difficulty: 'easy',
        estimatedTime: '10 minutes',
        tips: ['Start with family or friends', 'Practice in front of a mirror first']
      },
      { 
        id: 'speak-2', 
        title: 'Record yourself reading a short story', 
        description: 'Practice clear pronunciation and pacing',
        category: 'Communication', 
        xp: 20, 
        difficulty: 'medium',
        estimatedTime: '15 minutes',
        tips: ['Choose a story you enjoy', 'Listen back and note improvements needed']
      },
      { 
        id: 'speak-3', 
        title: 'Have a 5-minute conversation about your interests', 
        description: 'Practice sustained conversation on a topic you love',
        category: 'Communication', 
        xp: 30, 
        difficulty: 'hard',
        estimatedTime: '5-10 minutes',
        tips: ['Choose someone who shares your interest', 'Prepare 3 questions in advance']
      }
    ],
    'Learn routines': [
      { 
        id: 'routine-1', 
        title: 'Create a visual morning routine checklist', 
        description: 'Make a step-by-step guide for your morning',
        category: 'Daily Living', 
        xp: 15, 
        difficulty: 'easy',
        estimatedTime: '20 minutes',
        tips: ['Use pictures or symbols', 'Start with 5-7 simple steps']
      },
      { 
        id: 'routine-2', 
        title: 'Follow your routine for 3 consecutive days', 
        description: 'Practice consistency with your new routine',
        category: 'Daily Living', 
        xp: 25, 
        difficulty: 'medium',
        estimatedTime: '3 days',
        tips: ['Check off each step as you complete it', 'Adjust timing if needed']
      },
      { 
        id: 'routine-3', 
        title: 'Teach your routine to a family member', 
        description: 'Share what you\'ve learned about good routines',
        category: 'Daily Living', 
        xp: 35, 
        difficulty: 'hard',
        estimatedTime: '15 minutes',
        tips: ['Explain why each step is important', 'Show them your checklist']
      }
    ],
    'Play learning games': [
      { 
        id: 'game-1', 
        title: 'Complete a 50-piece puzzle', 
        description: 'Build focus and problem-solving skills',
        category: 'Cognitive', 
        xp: 12, 
        difficulty: 'easy',
        estimatedTime: '30 minutes',
        tips: ['Start with edge pieces', 'Take breaks if frustrated']
      },
      { 
        id: 'game-2', 
        title: 'Play a memory matching game for 10 minutes', 
        description: 'Strengthen your memory and concentration',
        category: 'Cognitive', 
        xp: 18, 
        difficulty: 'medium',
        estimatedTime: '10 minutes',
        tips: ['Start with fewer pairs', 'Try online or physical cards']
      },
      { 
        id: 'game-3', 
        title: 'Solve 5 logic puzzles or riddles', 
        description: 'Challenge your thinking and reasoning skills',
        category: 'Cognitive', 
        xp: 28, 
        difficulty: 'hard',
        estimatedTime: '20 minutes',
        tips: ['Use puzzle books or apps', 'Don\'t give up too quickly']
      }
    ],
    'Coaching': [
      { 
        id: 'coach-1', 
        title: 'Write down 3 personal goals for this month', 
        description: 'Set clear, achievable objectives for yourself',
        category: 'Self-Development', 
        xp: 20, 
        difficulty: 'easy',
        estimatedTime: '15 minutes',
        tips: ['Make goals specific and measurable', 'Start with small goals']
      },
      { 
        id: 'coach-2', 
        title: 'Track your progress on goals for one week', 
        description: 'Monitor how you\'re doing with your objectives',
        category: 'Self-Development', 
        xp: 30, 
        difficulty: 'medium',
        estimatedTime: '5 min/day for 7 days',
        tips: ['Use a simple chart or app', 'Note what helps or hurts progress']
      },
      { 
        id: 'coach-3', 
        title: 'Reflect on achievements and plan next steps', 
        description: 'Celebrate wins and set new challenges',
        category: 'Self-Development', 
        xp: 40, 
        difficulty: 'hard',
        estimatedTime: '30 minutes',
        tips: ['Write about what you learned', 'Share achievements with someone']
      }
    ],
    'Explore resources': [
      { 
        id: 'explore-1', 
        title: 'Find 3 helpful websites or apps for your interests', 
        description: 'Discover online resources that support your goals',
        category: 'Research', 
        xp: 15, 
        difficulty: 'easy',
        estimatedTime: '20 minutes',
        tips: ['Ask for recommendations', 'Try free versions first']
      },
      { 
        id: 'explore-2', 
        title: 'Join an online community related to your interests', 
        description: 'Connect with others who share your passions',
        category: 'Social', 
        xp: 25, 
        difficulty: 'medium',
        estimatedTime: '30 minutes',
        tips: ['Start by reading/observing', 'Look for supportive communities']
      }
    ]
  };

  let generatedTasks = [];
  
  // Generate tasks based on main goals
  mainGoals.forEach(goal => {
    if (taskTemplates[goal]) {
      generatedTasks = [...generatedTasks, ...taskTemplates[goal]];
    }
  });
  
  // Add role-specific tasks
  const roleSpecificTasks = {
    'Student': [
      { 
        id: 'student-1', 
        title: 'Organize your study space for better focus', 
        description: 'Create a dedicated, clutter-free area for learning',
        category: 'Academic', 
        xp: 15, 
        difficulty: 'easy',
        estimatedTime: '20 minutes',
        tips: ['Remove distractions', 'Have good lighting', 'Keep supplies organized']
      },
      { 
        id: 'student-2', 
        title: 'Complete and submit homework 1 day early', 
        description: 'Practice time management and reduce stress',
        category: 'Academic', 
        xp: 25, 
        difficulty: 'medium',
        estimatedTime: 'Varies',
        tips: ['Break large tasks into smaller parts', 'Set reminders', 'Ask for help if needed']
      },
      { 
        id: 'student-3', 
        title: 'Teach a concept you learned to someone else', 
        description: 'Reinforce your understanding by explaining to others',
        category: 'Academic', 
        xp: 30, 
        difficulty: 'medium',
        estimatedTime: '15 minutes',
        tips: ['Use simple language', 'Use examples', 'Check if they understand']
      }
    ],
    'Parent': [
      { 
        id: 'parent-1', 
        title: 'Plan a sensory-friendly family activity', 
        description: 'Create positive experiences for everyone',
        category: 'Family', 
        xp: 20, 
        difficulty: 'easy',
        estimatedTime: '30 minutes planning',
        tips: ['Consider everyone\'s needs', 'Have backup plans', 'Keep it simple']
      },
      { 
        id: 'parent-2', 
        title: 'Practice active listening with your child', 
        description: 'Strengthen communication and connection',
        category: 'Family', 
        xp: 25, 
        difficulty: 'medium',
        estimatedTime: '15 minutes',
        tips: ['Put devices away', 'Ask follow-up questions', 'Reflect back what you hear']
      }
    ],
    'Educator': [
      { 
        id: 'educator-1', 
        title: 'Create visual supports for a lesson', 
        description: 'Make learning more accessible for all students',
        category: 'Teaching', 
        xp: 20, 
        difficulty: 'medium',
        estimatedTime: '30 minutes',
        tips: ['Use clear, simple images', 'Test with students', 'Make them reusable']
      },
      { 
        id: 'educator-2', 
        title: 'Implement a new classroom routine', 
        description: 'Support student success with structure',
        category: 'Teaching', 
        xp: 30, 
        difficulty: 'medium',
        estimatedTime: '1 week implementation',
        tips: ['Explain the routine clearly', 'Practice together', 'Be consistent']
      }
    ],
    'Therapist': [
      { 
        id: 'therapist-1', 
        title: 'Research a new therapeutic technique', 
        description: 'Expand your toolkit for helping clients',
        category: 'Professional', 
        xp: 25, 
        difficulty: 'medium',
        estimatedTime: '45 minutes',
        tips: ['Look for evidence-based practices', 'Consider client needs', 'Take notes']
      }
    ],
    'Support Worker': [
      { 
        id: 'support-1', 
        title: 'Learn about a client\'s special interest', 
        description: 'Build connection and rapport',
        category: 'Professional', 
        xp: 20, 
        difficulty: 'easy',
        estimatedTime: '30 minutes',
        tips: ['Ask genuine questions', 'Show enthusiasm', 'Find ways to incorporate it']
      }
    ]
  };
  
  if (role && roleSpecificTasks[role]) {
    generatedTasks = [...generatedTasks, ...roleSpecificTasks[role]];
  }
  
  // Add age-appropriate tasks
  const ageSpecificTasks = {
    'Under 13': [
      { 
        id: 'kid-1', 
        title: 'Practice tying your shoes or another self-care skill', 
        description: 'Build independence in daily activities',
        category: 'Self-Care', 
        xp: 15, 
        difficulty: 'easy',
        estimatedTime: '10 minutes',
        tips: ['Practice when not in a hurry', 'Ask for help if needed', 'Celebrate progress']
      },
      { 
        id: 'kid-2', 
        title: 'Help with a household chore', 
        description: 'Contribute to your family and learn responsibility',
        category: 'Life Skills', 
        xp: 12, 
        difficulty: 'easy',
        estimatedTime: '15 minutes',
        tips: ['Choose age-appropriate tasks', 'Work alongside an adult', 'Take breaks if needed']
      }
    ],
    '13–17': [
      { 
        id: 'teen-1', 
        title: 'Make plans with a friend for this weekend', 
        description: 'Practice social planning and communication',
        category: 'Social', 
        xp: 20, 
        difficulty: 'medium',
        estimatedTime: '15 minutes',
        tips: ['Suggest specific activities', 'Be flexible with timing', 'Confirm the day before']
      },
      { 
        id: 'teen-2', 
        title: 'Learn to cook a simple meal', 
        description: 'Build independence and life skills',
        category: 'Life Skills', 
        xp: 25, 
        difficulty: 'medium',
        estimatedTime: '45 minutes',
        tips: ['Start with simple recipes', 'Read instructions carefully', 'Clean as you go']
      },
      { 
        id: 'teen-3', 
        title: 'Practice job interview skills', 
        description: 'Prepare for future opportunities',
        category: 'Career Prep', 
        xp: 30, 
        difficulty: 'hard',
        estimatedTime: '30 minutes',
        tips: ['Practice common questions', 'Dress appropriately', 'Make eye contact']
      }
    ],
    '18–25': [
      { 
        id: 'young-adult-1', 
        title: 'Create a monthly budget', 
        description: 'Learn financial management skills',
        category: 'Life Skills', 
        xp: 25, 
        difficulty: 'medium',
        estimatedTime: '30 minutes',
        tips: ['Track expenses for a week first', 'Use apps or spreadsheets', 'Include fun money']
      },
      { 
        id: 'young-adult-2', 
        title: 'Research and apply for one opportunity (job, course, etc.)', 
        description: 'Take steps toward your goals',
        category: 'Career Prep', 
        xp: 35, 
        difficulty: 'hard',
        estimatedTime: '1-2 hours',
        tips: ['Tailor your application', 'Ask someone to review it', 'Follow up appropriately']
      },
      { 
        id: 'young-adult-3', 
        title: 'Practice active listening in conversations', 
        description: 'Strengthen communication and relationships',
        category: 'Social', 
        xp: 18, 
        difficulty: 'easy',
        estimatedTime: 'Ongoing',
        tips: ['Put away distractions', 'Ask clarifying questions', 'Summarize what you heard']
      }
    ],
    '26–40': [
      { 
        id: 'adult-1', 
        title: 'Set up a self-care routine', 
        description: 'Prioritize your well-being and stress management',
        category: 'Wellness', 
        xp: 20, 
        difficulty: 'easy',
        estimatedTime: '20 minutes planning',
        tips: ['Start small', 'Schedule it like an appointment', 'Include things you enjoy']
      },
      { 
        id: 'adult-2', 
        title: 'Advocate for an accommodation you need', 
        description: 'Practice self-advocacy skills',
        category: 'Self-Advocacy', 
        xp: 35, 
        difficulty: 'hard',
        estimatedTime: '30 minutes',
        tips: ['Know your rights', 'Be specific about needs', 'Suggest solutions']
      }
    ],
    'Over 40': [
      { 
        id: 'mature-1', 
        title: 'Share your knowledge by mentoring someone', 
        description: 'Use your experience to help others',
        category: 'Giving Back', 
        xp: 30, 
        difficulty: 'medium',
        estimatedTime: '45 minutes',
        tips: ['Listen more than you speak', 'Share specific examples', 'Be encouraging']
      },
      { 
        id: 'mature-2', 
        title: 'Plan for a future goal or transition', 
        description: 'Prepare for changes and opportunities',
        category: 'Planning', 
        xp: 25, 
        difficulty: 'medium',
        estimatedTime: '1 hour',
        tips: ['Break big goals into steps', 'Research resources', 'Set realistic timelines']
      }
    ]
  };
  
  if (ageGroup && ageSpecificTasks[ageGroup]) {
    generatedTasks = [...generatedTasks, ...ageSpecificTasks[ageGroup]];
  }
  
  // Add neurodiversity-specific tasks
  if (neurodiversityTypes.includes('Autistic')) {
    generatedTasks.push(
      { 
        id: 'autism-1', 
        title: 'Practice flexibility by changing one small routine', 
        description: 'Build tolerance for unexpected changes',
        category: 'Flexibility', 
        xp: 20, 
        difficulty: 'medium',
        estimatedTime: '15 minutes',
        tips: ['Start with very small changes', 'Plan the change in advance', 'Have a comfort item nearby']
      },
      { 
        id: 'autism-2', 
        title: 'Create a social story for an upcoming event', 
        description: 'Prepare for social situations',
        category: 'Social Skills', 
        xp: 25, 
        difficulty: 'medium',
        estimatedTime: '30 minutes',
        tips: ['Include what to expect', 'Practice beforehand', 'Bring it with you']
      }
    );
  }
  
  if (neurodiversityTypes.includes('ADHD')) {
    generatedTasks.push(
      { 
        id: 'adhd-1', 
        title: 'Use a timer for focused work (Pomodoro technique)', 
        description: 'Practice sustained attention with breaks',
        category: 'Focus', 
        xp: 18, 
        difficulty: 'easy',
        estimatedTime: '25 minutes work + 5 min break',
        tips: ['Start with shorter periods if needed', 'Remove distractions', 'Reward yourself after']
      },
      { 
        id: 'adhd-2', 
        title: 'Organize one small area using a system', 
        description: 'Create structure to support daily life',
        category: 'Organization', 
        xp: 15, 
        difficulty: 'easy',
        estimatedTime: '20 minutes',
        tips: ['Choose a system that makes sense to you', 'Label everything', 'Take before/after photos']
      }
    );
  }
  
  if (neurodiversityTypes.includes('Sensory Sensitive')) {
    generatedTasks.push(
      { 
        id: 'sensory-1', 
        title: 'Create a sensory comfort kit', 
        description: 'Prepare tools for sensory regulation',
        category: 'Self-Regulation', 
        xp: 20, 
        difficulty: 'easy',
        estimatedTime: '30 minutes',
        tips: ['Include items for all senses', 'Keep it portable', 'Test items first']
      },
      { 
        id: 'sensory-2', 
        title: 'Practice a sensory break routine', 
        description: 'Learn to recognize and respond to sensory needs',
        category: 'Self-Regulation', 
        xp: 22, 
        difficulty: 'medium',
        estimatedTime: '10 minutes',
        tips: ['Find a quiet space', 'Use deep breathing', 'Try different sensory inputs']
      }
    );
  }
  
  // Add sensory preference-based tasks
  if (sensoryPreferences.includes('Low brightness')) {
    generatedTasks.push({
      id: 'sensory-lighting', 
      title: 'Adjust lighting in your main spaces', 
      description: 'Create comfortable visual environments',
      category: 'Environment', 
      xp: 12, 
      difficulty: 'easy',
      estimatedTime: '15 minutes',
      tips: ['Use lamps instead of overhead lights', 'Try warm-toned bulbs', 'Use curtains or blinds']
    });
  }
  
  if (sensoryPreferences.includes('More visuals')) {
    generatedTasks.push({
      id: 'visual-supports', 
      title: 'Create visual supports for a daily routine', 
      description: 'Use pictures to support understanding',
      category: 'Visual Supports', 
      xp: 18, 
      difficulty: 'easy',
      estimatedTime: '25 minutes',
      tips: ['Use photos or drawings', 'Make them large enough to see clearly', 'Put them where you\'ll see them']
    });
  }
  
  // Ensure we have at least some default tasks if nothing else applies
  if (generatedTasks.length === 0) {
    generatedTasks = [
      { 
        id: 'default-1', 
        title: 'Take a mindful 10-minute walk', 
        description: 'Connect with your environment and reduce stress',
        category: 'Wellness', 
        xp: 10, 
        difficulty: 'easy',
        estimatedTime: '10 minutes',
        tips: ['Notice things around you', 'Breathe deeply', 'Go at your own pace']
      },
      { 
        id: 'default-2', 
        title: 'Write in a journal for 5 minutes', 
        description: 'Reflect on your day and thoughts',
        category: 'Self-Reflection', 
        xp: 15, 
        difficulty: 'easy',
        estimatedTime: '5 minutes',
        tips: ['Write about anything', 'Don\'t worry about grammar', 'Be honest with yourself']
      },
      { 
        id: 'default-3', 
        title: 'Practice deep breathing for relaxation', 
        description: 'Learn a simple stress management technique',
        category: 'Wellness', 
        xp: 12, 
        difficulty: 'easy',
        estimatedTime: '5 minutes',
        tips: ['Find a comfortable position', 'Breathe in for 4, hold for 4, out for 4', 'Focus on your breath']
      },
      { 
        id: 'default-4', 
        title: 'Organize your workspace or room', 
        description: 'Create a more functional environment',
        category: 'Organization', 
        xp: 18, 
        difficulty: 'easy',
        estimatedTime: '20 minutes',
        tips: ['Start with one small area', 'Have designated places for things', 'Remove items you don\'t need']
      }
    ];
  }
  
  // Remove duplicates and limit to reasonable number
  const uniqueTasks = generatedTasks.filter((task, index, self) => 
    index === self.findIndex(t => t.id === task.id)
  );
  
  return uniqueTasks.slice(0, 15); // Limit to 15 tasks initially
};

// Badge System Services
export const checkAndAwardBadges = (currentProgress, newXP, newCompletedTasks) => {
  const badgeDefinitions = [
    { 
      id: 'first-steps', 
      name: 'First Steps', 
      description: 'Complete your first task', 
      xpRequired: 0, 
      taskCountRequired: 1,
      icon: '🎯',
      type: 'milestone'
    },
    { 
      id: 'communicator', 
      name: 'Communicator', 
      description: 'Complete 3 communication tasks', 
      categoryRequired: 'Communication',
      categoryCount: 3,
      icon: '🗣️',
      type: 'category'
    },
    { 
      id: 'routine-master', 
      name: 'Routine Master', 
      description: 'Complete 3 daily living tasks', 
      categoryRequired: 'Daily Living',
      categoryCount: 3,
      icon: '📅',
      type: 'category'
    },
    { 
      id: 'brain-trainer', 
      name: 'Brain Trainer', 
      description: 'Complete 5 cognitive tasks', 
      categoryRequired: 'Cognitive',
      categoryCount: 5,
      icon: '🧠',
      type: 'category'
    },
    { 
      id: 'level-up', 
      name: 'Level Up!', 
      description: 'Reach level 2', 
      xpRequired: 100, 
      icon: '⬆️',
      type: 'level'
    },
    { 
      id: 'xp-collector', 
      name: 'XP Collector', 
      description: 'Earn 200 XP', 
      xpRequired: 200, 
      icon: '💎',
      type: 'xp'
    },
    { 
      id: 'task-master', 
      name: 'Task Master', 
      description: 'Complete 10 tasks', 
      taskCountRequired: 10,
      icon: '🏆',
      type: 'milestone'
    },
    { 
      id: 'consistent', 
      name: 'Consistent', 
      description: 'Complete tasks 5 days in a row', 
      streakRequired: 5,
      icon: '🔥',
      type: 'streak'
    },
    { 
      id: 'wellness-warrior', 
      name: 'Wellness Warrior', 
      description: 'Complete 3 wellness tasks', 
      categoryRequired: 'Wellness',
      categoryCount: 3,
      icon: '🌟',
      type: 'category'
    },
    { 
      id: 'social-butterfly', 
      name: 'Social Butterfly', 
      description: 'Complete 3 social tasks', 
      categoryRequired: 'Social',
      categoryCount: 3,
      icon: '🦋',
      type: 'category'
    }
  ];

  const currentBadgeIds = currentProgress.badges.map(badge => badge.id);
  const newBadges = [];

  badgeDefinitions.forEach(badge => {
    if (currentBadgeIds.includes(badge.id)) return;

    let earned = false;

    switch (badge.type) {
      case 'xp':
        earned = newXP >= badge.xpRequired;
        break;
      case 'milestone':
        if (badge.taskCountRequired) {
          earned = newCompletedTasks.length >= badge.taskCountRequired;
        }
        break;
      case 'level':
        const newLevel = Math.floor(newXP / 100) + 1;
        earned = newLevel >= 2 && badge.id === 'level-up';
        break;
      case 'category':
        // This would require task category information to be passed
        // For now, we'll implement a simplified version
        earned = false; // Will be implemented when task categories are tracked
        break;
      case 'streak':
        earned = (currentProgress.streakDays || 0) >= badge.streakRequired;
        break;
    }

    if (earned) {
      newBadges.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        earnedAt: new Date().toISOString()
      });
    }
  });

  return newBadges;
};

// Task Completion Service
export const completeTask = async (userId, taskId, taskXP, tasks) => {
  try {
    const userProgress = await getUserProgress(userId);
    
    if (userProgress.completedTasks.includes(taskId)) {
      throw new Error('Task already completed');
    }

    const newXP = userProgress.xp + taskXP;
    const newLevel = Math.floor(newXP / 100) + 1;
    const newCompletedTasks = [...userProgress.completedTasks, taskId];
    
    // Check for new badges
    const newBadges = checkAndAwardBadges(userProgress, newXP, newCompletedTasks);
    const allBadges = [...userProgress.badges, ...newBadges];
    
    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = userProgress.lastActiveDate;
    let streakDays = userProgress.streakDays || 0;
    
    if (lastActiveDate) {
      const daysDiff = Math.floor((new Date(today) - new Date(lastActiveDate)) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        streakDays += 1;
      } else if (daysDiff > 1) {
        streakDays = 1;
      }
    } else {
      streakDays = 1;
    }

    const updatedProgress = {
      xp: newXP,
      level: newLevel,
      badges: allBadges,
      completedTasks: newCompletedTasks,
      streakDays,
      lastActiveDate: today,
      updatedAt: serverTimestamp()
    };

    await updateUserProgress(userId, updatedProgress);
    
    return {
      success: true,
      newBadges,
      updatedProgress: { ...userProgress, ...updatedProgress }
    };
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

// Analytics and Insights
export const getUserAnalytics = async (userId) => {
  try {
    const userProgress = await getUserProgress(userId);
    const onboardingData = await getOnboardingData(userId);
    
    const analytics = {
      totalXP: userProgress.xp,
      currentLevel: userProgress.level,
      tasksCompleted: userProgress.completedTasks.length,
      badgesEarned: userProgress.badges.length,
      currentStreak: userProgress.streakDays || 0,
      completionRate: 0, // Will be calculated based on assigned tasks
      favoriteCategory: null, // Will be determined from completed task categories
      weeklyProgress: [], // Can be implemented with detailed completion tracking
      achievements: userProgress.badges
    };
    
    return analytics;
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
};