import { useState, useEffect } from 'react';
import { Calendar, Star, Award, TrendingUp, CheckCircle, X, PlusCircle, Bell, Sparkles, Target, Zap } from 'lucide-react';

// Main App Component
export default function LifeSkillsTracker() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('lifeskills-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: 1, name: 'Brush teeth', category: 'Self-Care', xp: 10, completed: false, streak: 3 },
      { id: 2, name: 'Apply for jobs', category: 'Career', xp: 50, completed: false, streak: 1 },
      { id: 3, name: 'Social call with friend', category: 'Social', xp: 30, completed: false, streak: 0 },
      { id: 4, name: 'Make bed', category: 'Home', xp: 5, completed: true, streak: 7 },
    ];
  });
  
  const [user, setUser] = useState({
    level: 3,
    xp: 280,
    nextLevelXp: 500,
    badges: [
      { id: 1, name: 'Self-Care Star', icon: '🌟', achieved: true, description: 'Complete 5 self-care tasks' },
      { id: 2, name: 'Social Butterfly', icon: '🦋', achieved: false, description: 'Complete 3 social tasks' },
      { id: 3, name: 'Career Climber', icon: '🧗', achieved: false, description: 'Complete 10 career tasks' },
      { id: 4, name: 'Home Hero', icon: '🏠', achieved: true, description: 'Complete 5 home tasks' },
      { id: 5, name: 'Streak Master', icon: '🔥', achieved: false, description: 'Maintain a 7-day streak' },
      { id: 6, name: 'XP Champion', icon: '⭐', achieved: false, description: 'Earn 1000 total XP' },
    ]
  });
  
  const [newTask, setNewTask] = useState({ name: '', category: 'Self-Care', xp: 10 });
  const [showAddTask, setShowAddTask] = useState(false);
  const [showCalendarSync, setShowCalendarSync] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [completionReward, setCompletionReward] = useState(null);
  const [floatingXP, setFloatingXP] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  
  const categories = ['Self-Care', 'Career', 'Social', 'Home', 'Education', 'Health'];
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lifeskills-tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Generate encouraging message when a task is completed
  const generateEncouragement = () => {
    const messages = [
      "Amazing job! You're building independence one task at a time! 🌟",
      "Look at you go! Your future self thanks you for this effort! 🚀",
      "That's some impressive progress! Keep building those life skills! 💪",
      "Fantastic work! You're leveling up in real life! 🎯",
      "You're crushing it! These small steps lead to big changes! ✨"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  // Check for new badges
  const checkForNewBadges = (completedTasks, totalXp, maxStreak) => {
    const newBadges = [];
    
    user.badges.forEach(badge => {
      if (!badge.achieved) {
        let shouldEarn = false;
        
        switch (badge.id) {
          case 1: // Self-Care Star
            shouldEarn = completedTasks.filter(t => t.category === 'Self-Care').length >= 5;
            break;
          case 2: // Social Butterfly
            shouldEarn = completedTasks.filter(t => t.category === 'Social').length >= 3;
            break;
          case 3: // Career Climber
            shouldEarn = completedTasks.filter(t => t.category === 'Career').length >= 10;
            break;
          case 4: // Home Hero
            shouldEarn = completedTasks.filter(t => t.category === 'Home').length >= 5;
            break;
          case 5: // Streak Master
            shouldEarn = maxStreak >= 7;
            break;
          case 6: // XP Champion
            shouldEarn = totalXp >= 1000;
            break;
        }
        
        if (shouldEarn) {
          newBadges.push(badge);
        }
      }
    });
    
    return newBadges;
  };
  
  // Create floating XP animation
  const createFloatingXP = (xp, streakBonus = 0) => {
    const id = Date.now() + Math.random();
    const newFloatingXP = {
      id,
      xp: xp + streakBonus,
      streakBonus,
      x: Math.random() * 200 + 100,
      y: Math.random() * 100 + 50
    };
    
    setFloatingXP(prev => [...prev, newFloatingXP]);
    
    setTimeout(() => {
      setFloatingXP(prev => prev.filter(item => item.id !== id));
    }, 2000);
  };
  
  // Handle task completion
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const completed = !task.completed;
        const streak = completed ? task.streak + 1 : Math.max(0, task.streak - 1);
        
        // If completing the task, show rewards and update XP
        if (completed && !task.completed) {
          const streakBonus = streak > 3 ? Math.floor(task.xp * 0.2) : 0;
          const earnedXp = task.xp + streakBonus;
          
          // Create floating XP animation
          createFloatingXP(task.xp, streakBonus);
          
          setUser(prev => {
            const newXp = prev.xp + earnedXp;
            let newLevel = prev.level;
            let nextLevelXp = prev.nextLevelXp;
            
            // Level up if enough XP
            if (newXp >= nextLevelXp) {
              newLevel += 1;
              nextLevelXp = Math.floor(nextLevelXp * 1.5);
              setShowAnimation(true);
              setTimeout(() => setShowAnimation(false), 3000);
            }
            
            // Check for new badges
            const completedTasks = tasks.filter(t => t.completed || t.id === taskId);
            const maxStreak = Math.max(...tasks.map(t => t.streak), streak);
            const newBadges = checkForNewBadges(completedTasks, newXp, maxStreak);
            
            if (newBadges.length > 0) {
              setEarnedBadges(newBadges);
              setTimeout(() => setEarnedBadges([]), 4000);
              
              // Update badges to achieved
              const updatedBadges = prev.badges.map(badge => 
                newBadges.find(nb => nb.id === badge.id) ? { ...badge, achieved: true } : badge
              );
              
              return {
                ...prev,
                level: newLevel,
                xp: newXp,
                nextLevelXp,
                badges: updatedBadges
              };
            }
            
            return {
              ...prev,
              level: newLevel,
              xp: newXp,
              nextLevelXp
            };
          });
          
          // Show completion reward
          setCompletionReward({
            taskName: task.name,
            xp: earnedXp,
            streakBonus,
            streak
          });
          
          setTimeout(() => setCompletionReward(null), 3000);
          
          setEncouragement(generateEncouragement());
          setTimeout(() => setEncouragement(''), 5000);
        }
        
        return { ...task, completed, streak };
      }
      return task;
    }));
  };
  
  // Add a new task
  const handleAddTask = () => {
    if (newTask.name.trim() === '') return;
    
    const newTaskObject = {
      id: Date.now(),
      name: newTask.name,
      category: newTask.category,
      xp: Number(newTask.xp),
      completed: false,
      streak: 0
    };
    
    setTasks([...tasks, newTaskObject]);
    setNewTask({ name: '', category: 'Self-Care', xp: 10 });
    setShowAddTask(false);
  };
  
  // Delete a task
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  // Connect to Google Calendar
  const connectToCalendar = () => {
    setCalendarConnected(true);
    setShowCalendarSync(false);
  };
  
  // Render XP progress bar
  const renderProgress = () => {
    const percentage = (user.xp / user.nextLevelXp) * 100;
    return (
      <div className="w-full bg-blue-100 rounded-full h-3 mb-1 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Floating XP Animations */}
      {floatingXP.map(item => (
        <div
          key={item.id}
          className="fixed pointer-events-none z-50 animate-bounce"
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            animation: 'float-up 2s ease-out forwards'
          }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1 font-bold">
            <Zap size={16} />
            +{item.xp} XP
            {item.streakBonus > 0 && (
              <span className="text-yellow-300">
                (+{item.streakBonus} streak!)
              </span>
            )}
          </div>
        </div>
      ))}
      
      {/* Badge Earned Animation */}
      {earnedBadges.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 pointer-events-none">
          <div className="bg-white p-8 rounded-2xl shadow-2xl animate-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <h2 className="text-2xl font-bold text-blue-600 mb-2">Badge Earned!</h2>
              {earnedBadges.map(badge => (
                <div key={badge.id} className="mb-4">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800">{badge.name}</h3>
                  <p className="text-gray-600">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-full">
              <Target size={24} />
            </div>
            <h1 className="text-2xl font-bold">LifeQuest</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCalendarSync(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500 hover:bg-blue-400 transition-colors shadow-md"
            >
              <Calendar size={16} />
              <span className="text-sm">{calendarConnected ? 'Synced' : 'Sync'}</span>
            </button>
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full shadow-md">
              <Star size={16} fill="currentColor" />
              <span className="font-bold">Level {user.level}</span>
            </div>
          </div>
        </div>
        
        {/* XP Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1">
              <Sparkles size={14} />
              XP: {user.xp}/{user.nextLevelXp}
            </span>
            <span>{Math.floor((user.xp / user.nextLevelXp) * 100)}%</span>
          </div>
          {renderProgress()}
        </div>
      </header>
      
      {/* Task Completion Reward */}
      {completionReward && (
        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="font-bold">Task Completed: {completionReward.taskName}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Zap size={14} />
                  +{completionReward.xp} XP
                </span>
                {completionReward.streakBonus > 0 && (
                  <span className="flex items-center gap-1 text-yellow-200">
                    <TrendingUp size={14} />
                    Streak Bonus: +{completionReward.streakBonus} XP
                  </span>
                )}
                {completionReward.streak > 1 && (
                  <span className="flex items-center gap-1">
                    🔥 {completionReward.streak} day streak!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Encouragement Message */}
      {encouragement && (
        <div className="bg-gradient-to-r from-green-100 to-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 transition-all duration-500 ease-in animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <p className="font-medium">{encouragement}</p>
          </div>
        </div>
      )}
      
      {/* Level Up Animation */}
      {showAnimation && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-2xl flex flex-col items-center animate-bounce shadow-2xl">
            <div className="text-6xl mb-4 animate-spin">🎉</div>
            <h2 className="text-4xl font-bold text-blue-600 mb-4">LEVEL UP!</h2>
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-2xl font-bold text-gray-800">You reached Level {user.level}!</p>
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <Sparkles size={20} />
              <span className="font-medium">New challenges unlocked!</span>
              <Sparkles size={20} />
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b border-blue-100">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'tasks' 
                ? 'text-blue-600 border-b-3 border-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={18} />
              Tasks
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'badges' 
                ? 'text-blue-600 border-b-3 border-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Award size={18} />
              Badges
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'stats' 
                ? 'text-blue-600 border-b-3 border-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp size={18} />
              Stats
            </div>
          </button>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'tasks' && (
          <>
            {/* Task List */}
            <div className="mb-16 space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`bg-white p-4 rounded-xl shadow-md border-2 transition-all duration-200 ${
                    task.completed 
                      ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-green-50' 
                      : 'border-gray-100 hover:border-blue-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button 
                        onClick={() => toggleTaskCompletion(task.id)} 
                        className={`p-3 rounded-full mr-4 transition-all duration-200 ${
                          task.completed 
                            ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-500'
                        }`}
                      >
                        <CheckCircle size={24} fill={task.completed ? 'currentColor' : 'none'} />
                      </button>
                      <div>
                        <h3 className={`font-semibold text-lg ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                        }`}>
                          {task.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-2 gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.category === 'Self-Care' ? 'bg-blue-100 text-blue-800' :
                            task.category === 'Career' ? 'bg-purple-100 text-purple-800' :
                            task.category === 'Social' ? 'bg-green-100 text-green-800' :
                            task.category === 'Home' ? 'bg-yellow-100 text-yellow-800' :
                            task.category === 'Education' ? 'bg-red-100 text-red-800' :
                            'bg-pink-100 text-pink-800'
                          }`}>
                            {task.category}
                          </span>
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <Zap size={14} /> {task.xp} XP
                          </span>
                          {task.streak > 0 && (
                            <span className="flex items-center gap-1 text-orange-500 font-medium">
                              <TrendingUp size={14} /> {task.streak} day streak 🔥
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-lg">No tasks yet. Add some life skills to track!</p>
                  <p className="text-sm mt-2">Start building your independence journey</p>
                </div>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'badges' && (
          <div className="grid grid-cols-2 gap-4">
            {user.badges.map(badge => (
              <div 
                key={badge.id}
                className={`bg-white p-6 rounded-xl shadow-md border-2 flex flex-col items-center transition-all duration-200 ${
                  badge.achieved 
                    ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-yellow-50 hover:shadow-lg' 
                    : 'border-gray-200 opacity-60'
                }`}
              >
                <div className={`text-5xl mb-3 ${badge.achieved ? '' : 'grayscale'}`}>
                  {badge.icon}
                </div>
                <h3 className="font-bold text-center text-gray-800 mb-1">{badge.name}</h3>
                <p className="text-xs text-gray-600 text-center mb-2">{badge.description}</p>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  badge.achieved 
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {badge.achieved ? '✨ Achieved' : '🔒 Locked'}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
              <h2 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">
                <TrendingUp className="text-blue-600" />
                Your Progress
              </h2>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Target size={18} className="text-blue-500" />
                  Task Completion
                </h3>
                <div className="w-full bg-blue-50 rounded-full h-6 border border-blue-100">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full transition-all duration-1000 flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${Math.max(15, (tasks.filter(t => t.completed).length / Math.max(1, tasks.length)) * 100)}%` }}
                  >
                    {Math.round((tasks.filter(t => t.completed).length / Math.max(1, tasks.length)) * 100)}%
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                  <CheckCircle size={14} className="text-green-500" />
                  {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">Category Breakdown</h3>
                <div className="space-y-4">
                  {categories.map(category => {
                    const categoryTasks = tasks.filter(t => t.category === category);
                    if (categoryTasks.length === 0) return null;
                    
                    const completedTasks = categoryTasks.filter(t => t.completed).length;
                    const percentage = (completedTasks / categoryTasks.length) * 100;
                    
                    return (
                      <div key={category} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm font-medium mb-2">
                          <span className="text-gray-700">{category}</span>
                          <span className="text-blue-600">{completedTasks}/{categoryTasks.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              category === 'Self-Care' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                              category === 'Career' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                              category === 'Social' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                              category === 'Home' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                              category === 'Education' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                              'bg-gradient-to-r from-pink-400 to-pink-600'
                            }`}
                            style={{ width: `${Math.max(5, percentage)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  🔥 Streak Champions
                </h3>
                <div className="space-y-2">
                  {tasks.filter(t => t.streak > 0)
                    .sort((a, b) => b.streak - a.streak)
                    .slice(0, 3)
                    .map(task => (
                      <div key={task.id} className="flex items-center justify-between py-3 px-4 bg-orange-50 rounded-lg border border-orange-100">
                        <span className="font-medium text-gray-800">{task.name}</span>
                        <span className="flex items-center text-orange-600 font-bold">
                          <TrendingUp size={16} className="mr-1" /> {task.streak} days 🔥
                        </span>
                      </div>
                    ))
                  }
                  
                  {tasks.filter(t => t.streak > 0).length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-3xl mb-2">🔥</div>
                      <p className="text-sm">No active streaks yet</p>
                      <p className="text-xs">Complete tasks consistently to build streaks!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Add Task Button */}
      {activeTab === 'tasks' && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowAddTask(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-110"
          >
            <PlusCircle size={32} />
          </button>
        </div>
      )}
      
      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-full text-white">
                <PlusCircle size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Add New Life Skill</h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Task Name
              </label>
              <input
                type="text"
                value={newTask.name}
                onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                placeholder="e.g. Brush teeth twice daily"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Category
              </label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Difficulty Level
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={newTask.xp}
                onChange={(e) => setNewTask({...newTask, xp: e.target.value})}
                className="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Easy (5 XP)
                </span>
                <span className="font-bold text-blue-600 flex items-center gap-1">
                  <Zap size={14} />
                  {newTask.xp} XP
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  Hard (100 XP)
                </span>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddTask(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Calendar Sync Modal */}
      {showCalendarSync && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-full text-white">
                <Calendar size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Google Calendar Sync</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Syncing with Google Calendar allows you to:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Visualize your daily routine</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Get reminders for scheduled tasks</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Track task completion history</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Build consistent habits visually</span>
                </div>
              </div>
            </div>
            
            {!calendarConnected ? (
              <button
                onClick={connectToCalendar}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Calendar size={20} />
                Connect to Google Calendar
              </button>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4 flex items-center">
                <CheckCircle size={24} className="text-green-500 mr-3" />
                <div>
                  <span className="font-semibold text-green-700">Calendar connected successfully!</span>
                  <p className="text-sm text-green-600">Your tasks will now sync automatically</p>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCalendarSync(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}