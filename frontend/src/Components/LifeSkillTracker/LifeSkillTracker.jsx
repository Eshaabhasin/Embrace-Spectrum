import { useState, useEffect } from 'react';
import { Calendar, Star, Award, TrendingUp, CheckCircle, X, PlusCircle, Bell } from 'lucide-react';

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
      { id: 1, name: 'Self-Care Star', icon: '🌟', achieved: true },
      { id: 2, name: 'Social Butterfly', icon: '🦋', achieved: false },
      { id: 3, name: 'Career Climber', icon: '🧗', achieved: false },
      { id: 4, name: 'Home Hero', icon: '🏠', achieved: true },
    ]
  });
  
  const [newTask, setNewTask] = useState({ name: '', category: 'Self-Care', xp: 10 });
  const [showAddTask, setShowAddTask] = useState(false);
  const [showCalendarSync, setShowCalendarSync] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [calendarConnected, setCalendarConnected] = useState(false);
  
  const categories = ['Self-Care', 'Career', 'Social', 'Home', 'Education', 'Health'];
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lifeskills-tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Generate encouraging message when a task is completed
  const generateEncouragement = () => {
    const messages = [
      "Amazing job! You're building independence one task at a time!",
      "Look at you go! Your future self thanks you for this effort!",
      "That's some impressive progress! Keep building those life skills!",
      "Fantastic work! You're leveling up in real life!",
      "You're crushing it! These small steps lead to big changes!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  // Handle task completion
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const completed = !task.completed;
        const streak = completed ? task.streak + 1 : Math.max(0, task.streak - 1);
        
        // If completing the task, show animation and update XP
        if (completed && !task.completed) {
          const earnedXp = task.xp + (streak > 3 ? Math.floor(task.xp * 0.2) : 0);
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
            
            return {
              ...prev,
              level: newLevel,
              xp: newXp,
              nextLevelXp
            };
          });
          
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
    // In a real app, this would initiate OAuth flow with Google Calendar API
    setCalendarConnected(true);
    setShowCalendarSync(false);
  };
  
  // Render XP progress bar
  const renderProgress = () => {
    const percentage = (user.xp / user.nextLevelXp) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
        <div 
          className="bg-green-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">LifeQuest</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCalendarSync(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500 hover:bg-indigo-400 transition-colors"
            >
              <Calendar size={16} />
              <span className="text-sm">{calendarConnected ? 'Synced' : 'Sync'}</span>
            </button>
            <div className="flex items-center gap-1 bg-indigo-500 px-3 py-1 rounded-full">
              <Star size={16} fill="yellow" stroke="orange" />
              <span className="font-bold">Level {user.level}</span>
            </div>
          </div>
        </div>
        
        {/* XP Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs">
            <span>XP: {user.xp}/{user.nextLevelXp}</span>
            <span>{Math.floor((user.xp / user.nextLevelXp) * 100)}%</span>
          </div>
          {renderProgress()}
        </div>
      </header>
      
      {/* Encouragement Message */}
      {encouragement && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 transition-all duration-500 ease-in animate-pulse">
          <p>{encouragement}</p>
        </div>
      )}
      
      {/* Level Up Animation */}
      {showAnimation && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center animate-bounce">
            <h2 className="text-3xl font-bold text-indigo-600 mb-4">LEVEL UP!</h2>
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-xl">You reached Level {user.level}!</p>
          </div>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'tasks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          >
            Tasks
          </button>
          <button 
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'badges' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          >
            Badges
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'stats' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          >
            Stats
          </button>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'tasks' && (
          <>
            {/* Task List */}
            <div className="mb-16">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`bg-white p-4 rounded-lg shadow mb-3 flex items-center justify-between ${task.completed ? 'border-l-4 border-green-500' : ''}`}
                >
                  <div className="flex items-center">
                    <button 
                      onClick={() => toggleTaskCompletion(task.id)} 
                      className={`p-2 rounded-full mr-3 ${task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                    >
                      <CheckCircle size={24} fill={task.completed ? '#10B981' : 'none'} />
                    </button>
                    <div>
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs mr-2">{task.category}</span>
                        <span className="flex items-center gap-1 mr-3">
                          <Star size={14} /> {task.xp} XP
                        </span>
                        {task.streak > 0 && (
                          <span className="flex items-center gap-1 text-orange-500">
                            <TrendingUp size={14} /> {task.streak} day streak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks yet. Add some life skills to track!</p>
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
                className={`bg-white p-6 rounded-lg shadow-sm flex flex-col items-center ${!badge.achieved ? 'opacity-50' : ''}`}
              >
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h3 className="font-bold text-center">{badge.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {badge.achieved ? 'Achieved' : 'Locked'}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold text-lg mb-4">Your Progress</h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Task Completion</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-indigo-600 h-4 rounded-full"
                  style={{ width: `${(tasks.filter(t => t.completed).length / Math.max(1, tasks.length)) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Category Breakdown</h3>
              <div className="space-y-3">
                {categories.map(category => {
                  const categoryTasks = tasks.filter(t => t.category === category);
                  if (categoryTasks.length === 0) return null;
                  
                  const completedTasks = categoryTasks.filter(t => t.completed).length;
                  const percentage = (completedTasks / categoryTasks.length) * 100;
                  
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span>{completedTasks}/{categoryTasks.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            category === 'Self-Care' ? 'bg-blue-500' :
                            category === 'Career' ? 'bg-purple-500' :
                            category === 'Social' ? 'bg-green-500' :
                            category === 'Home' ? 'bg-yellow-500' :
                            category === 'Education' ? 'bg-red-500' :
                            'bg-pink-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Streak Champions</h3>
              {tasks.filter(t => t.streak > 0)
                .sort((a, b) => b.streak - a.streak)
                .slice(0, 3)
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span>{task.name}</span>
                    <span className="flex items-center text-orange-500">
                      <TrendingUp size={16} className="mr-1" /> {task.streak} days
                    </span>
                  </div>
                ))
              }
              
              {tasks.filter(t => t.streak > 0).length === 0 && (
                <p className="text-sm text-gray-500">No active streaks yet</p>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Add Task Button */}
      {activeTab === 'tasks' && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowAddTask(true)}
            className="bg-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-indigo-700"
          >
            <PlusCircle size={30} />
          </button>
        </div>
      )}
      
      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Life Skill Task</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Task Name
              </label>
              <input
                type="text"
                value={newTask.name}
                onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                placeholder="e.g. Brush teeth twice daily"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Category
              </label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                XP Value
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={newTask.xp}
                onChange={(e) => setNewTask({...newTask, xp: e.target.value})}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Easy (5 XP)</span>
                <span>{newTask.xp} XP</span>
                <span>Hard (100 XP)</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Google Calendar Sync</h2>
            
            <p className="mb-4">
              Syncing with Google Calendar allows you to:
            </p>
            
            <ul className="list-disc pl-5 mb-6 space-y-2">
              <li>Visualize your daily routine</li>
              <li>Get reminders for scheduled tasks</li>
              <li>Track task completion history</li>
              <li>Build consistent habits visually</li>
            </ul>
            
            {!calendarConnected ? (
              <button
                onClick={connectToCalendar}
                className="w-full py-3 bg-blue-500 text-white rounded flex items-center justify-center gap-2 hover:bg-blue-600"
              >
                <Calendar size={20} />
                Connect to Google Calendar
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-3 flex items-center">
                <CheckCircle size={20} className="text-green-500 mr-2" />
                <span>Calendar connected successfully!</span>
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowCalendarSync(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
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