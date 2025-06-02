import React, { useState, useEffect } from 'react';
import { 
  X, Check, PlusCircle, Move, Calendar, Clock, 
  Calendar as CalendarIcon, LogIn, LogOut, ExternalLink
} from 'lucide-react';
import GoogleAuthService from './GoogleCalendar/GoogleAuthService'
import GoogleCalendarService from './GoogleCalendar/GoogleCalendarService';

const TasksPanel = ({
  tasks,
  setTasks,
  newTask,
  setNewTask,
  draggedTask,
  setDraggedTask
}) => {
  // New state variables for task scheduling
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDueTime, setTaskDueTime] = useState('');
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');

  // Check Google authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Try silent sign-in if possible
        const authStatus = await GoogleAuthService.silentSignIn(handleAuthSuccess);
        setIsGoogleAuthenticated(authStatus.success);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsGoogleAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = async (accessToken) => {
    setIsGoogleAuthenticated(true);
    
    if (isCalendarOpen) {
      fetchCalendarEvents(accessToken);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await GoogleAuthService.signIn(handleAuthSuccess);
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out from Google
  const signOutFromGoogle = async () => {
    try {
      await GoogleAuthService.signOut();
      setIsGoogleAuthenticated(false);
      setUpcomingEvents([]);
    } catch (error) {
      console.error("Google sign-out error:", error);
    }
  };

  // Fetch calendar events
  const fetchCalendarEvents = async (token) => {
  setIsLoading(true);
  try {
    const accessToken = token || GoogleAuthService.getAccessToken();
    console.log("Using access token for fetch:", accessToken ? "Token exists" : "No token");
    
    if (!accessToken) {
      throw new Error("No access token available");
    }

    const calendarService = new GoogleCalendarService(accessToken);
    const result = await calendarService.listEvents(5);
    
    if (result.success) {
      setUpcomingEvents(result.events);
    } else {
      console.error("Failed to fetch events:", result.error);
      
      // Handle authentication errors
      if (result.error && result.error.includes("authentication")) {
        alert("Your Google session has expired. Please sign in again.");
        await signOutFromGoogle();
      }
    }
  } catch (error) {
    console.error("Error fetching calendar events:", error);
  } finally {
    setIsLoading(false);
  }
};

  // Toggle calendar view
  const toggleCalendarView = () => {
    const newState = !isCalendarOpen;
    setIsCalendarOpen(newState);
    
    if (newState && isGoogleAuthenticated) {
      fetchCalendarEvents();
    }
  };

  // Add new task with calendar integration
  const addNewTask = async () => {
    if (newTask.trim()) {
      const newTaskObj = {
        id: `task-${Date.now()}`,
        content: newTask,
        priority: 'medium',
        createdAt: new Date(),
        dueDate: taskDueDate || null,
        dueTime: taskDueTime || null,
        description: taskDescription || '',
        googleEventId: null,
        googleEventLink: null
      };

      // Create Google Calendar event if authenticated and date is specified
      if (isGoogleAuthenticated && taskDueDate) {
        try {
          const accessToken = GoogleAuthService.getAccessToken();
          const calendarService = new GoogleCalendarService(accessToken);
          const result = await calendarService.createEvent(newTaskObj);
          
          if (result.success) {
            newTaskObj.googleEventId = result.eventId;
            newTaskObj.googleEventLink = result.eventLink;
          } else {
            console.error("Failed to create calendar event:", result.error);
          }
        } catch (error) {
          console.error("Error creating calendar event:", error);
        }
      }

      setTasks(prev => ({
        ...prev,
        todo: [...prev.todo, newTaskObj]
      }));
      
      // Reset form fields
      setNewTask("");
      setTaskDueDate("");
      setTaskDueTime("");
      setTaskDescription("");
    }
  };

  // Remove task with calendar integration
  const removeTask = async (taskId, column) => {
    const taskToRemove = tasks[column].find(task => task.id === taskId);
    
    // Remove from Google Calendar if it has an associated event
    if (isGoogleAuthenticated && taskDueDate) {
  try {
    const accessToken = GoogleAuthService.getAccessToken();
    console.log("Using access token:", accessToken ? "Token exists" : "No token");
    
    // Validate token is available
    if (!accessToken) {
      throw new Error("No access token is available. Please sign in again.");
    }
    
    const calendarService = new GoogleCalendarService(accessToken);
    const result = await calendarService.createEvent(newTaskObj);
    
    if (result.success) {
      newTaskObj.googleEventId = result.eventId;
      newTaskObj.googleEventLink = result.eventLink;
    } else {
      console.error("Failed to create calendar event:", result.error);
      
      // If authentication error, try to re-authenticate
      if (result.error && result.error.includes("authentication")) {
        alert("Your Google session has expired. Please sign in again.");
        await signOutFromGoogle();
        await signInWithGoogle();
      }
    }
  } catch (error) {
    console.error("Error creating calendar event:", error);
  }
}
    
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].filter(task => task.id !== taskId)
    }));
  };

  // Handle drag start
  const handleDragStart = (e, task, sourceColumn) => {
    setDraggedTask({ task, sourceColumn });
    e.dataTransfer.setData('text/plain', '');
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop with calendar integration
  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    if (!draggedTask) return;

    const updatedTasks = { ...tasks };
    const sourceColumnTasks = updatedTasks[draggedTask.sourceColumn].filter(
      t => t.id !== draggedTask.task.id
    );
    updatedTasks[draggedTask.sourceColumn] = sourceColumnTasks;

    // Update Google Calendar event if task is moved to "completed" column
    if (isGoogleAuthenticated && 
        draggedTask.task.googleEventId && 
        targetColumn === 'completed' && 
        draggedTask.sourceColumn !== 'completed') {
      try {
        const accessToken = GoogleAuthService.getAccessToken();
        const calendarService = new GoogleCalendarService(accessToken);

        const updatedTask = {
          ...draggedTask.task,
          content: `[Completed] ${draggedTask.task.content}`,
          completedAt: new Date()
        };
        
        await calendarService.updateEvent(draggedTask.task.googleEventId, updatedTask);
        draggedTask.task.content = updatedTask.content;
        draggedTask.task.completedAt = updatedTask.completedAt;
      } catch (error) {
        console.error("Error updating calendar event:", error);
      }
    }

    updatedTasks[targetColumn] = [
      ...updatedTasks[targetColumn], 
      draggedTask.task
    ];

    setTasks(updatedTasks);
    setDraggedTask(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format calendar event time
  const formatEventTime = (event) => {
    if (!event.start?.dateTime) return '';
    
    const startTime = new Date(event.start.dateTime);
    return startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-[40vw] border-l border-blue-200 p-4 rounded-xl bg-blue-50 overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">Tasks</h2>
        <div className="flex gap-2">
          <button 
            onClick={toggleCalendarView}
            className="text-blue-600 hover:text-blue-800"
            title="Toggle Calendar View"
          >
            <CalendarIcon className="w-6 h-6" />
          </button>
          
          {isGoogleAuthenticated ? (
            <button 
              onClick={signOutFromGoogle}
              className="text-red-600 hover:text-red-800"
              title="Sign out from Google"
              disabled={isLoading}
            >
              <LogOut className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="text-green-600 hover:text-green-800"
              title="Sign in with Google"
              disabled={isLoading}
            >
              <LogIn className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Google Calendar Integration Status */}
      <div className="mb-4 p-2 bg-white rounded-md shadow-sm">
        <p className="text-sm">
          Google Calendar: 
          <span className={`ml-2 font-semibold ${isGoogleAuthenticated ? 'text-green-600' : 'text-gray-500'}`}>
            {isGoogleAuthenticated ? 'Connected' : 'Not Connected'}
          </span>
        </p>
        {!isGoogleAuthenticated && (
          <p className="text-xs mt-1 text-gray-500">
            Connect your Google Calendar to sync tasks with your calendar.
          </p>
        )}
      </div>

      {/* Calendar View (conditionally rendered) */}
      {isCalendarOpen && (
        <div className="mb-4 bg-white p-3 rounded-md shadow-sm">
          <h3 className="text-md font-medium mb-2 text-blue-800">
            Upcoming Events
          </h3>
          
          {isLoading ? (
            <p className="text-center text-gray-500 text-sm py-2">Loading events...</p>
          ) : (
            <>
              {isGoogleAuthenticated ? (
                <>
                  {upcomingEvents.length > 0 ? (
                    <ul className="text-sm">
                      {upcomingEvents.map(event => (
                        <li key={event.id} className="mb-2 p-2 bg-blue-50 rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{event.summary}</span>
                            <span className="text-xs text-gray-500">
                              {formatEventTime(event)}
                            </span>
                          </div>
                          <a 
                            href={event.htmlLink} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 flex items-center mt-1"
                          >
                            View in Calendar
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-2">
                      No upcoming events found
                    </p>
                  )}
                  
                  <button
                    onClick={() => fetchCalendarEvents()}
                    className="w-full mt-2 p-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Refresh Events
                  </button>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 mb-2">
                    Connect your Google account to view calendar events
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    disabled={isLoading}
                  >
                    Connect Google Calendar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Task Input with Date and Time */}
      <div className="mb-4">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
          className="w-full p-2 border border-blue-200 rounded-md mb-2 focus:ring-2 focus:ring-blue-300"
          onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
        />
        
        <textarea
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Task description (optional)"
          className="w-full p-2 border border-blue-200 rounded-md mb-2 focus:ring-2 focus:ring-blue-300 text-sm"
          rows={2}
        />
        
        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="pl-10 w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-300 text-sm"
            />
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="time"
              value={taskDueTime}
              onChange={(e) => setTaskDueTime(e.target.value)}
              className="pl-10 w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-300 text-sm"
            />
          </div>
        </div>
        
        <button 
          onClick={addNewTask}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Task {taskDueDate && 'to Calendar'}
        </button>
      </div>

      {/* Task Columns */}
      {['todo', 'inProgress', 'completed'].map((columnId) => (
        <div 
          key={columnId}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, columnId)}
          className="mb-4 min-h-[80px] border-2 border-dashed border-blue-200 rounded-md p-2"
        >
          <h3 className="text-md font-medium mb-2 capitalize text-blue-800">
            {columnId.replace(/([A-Z])/g, ' $1')}
          </h3>
          {tasks[columnId].map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task, columnId)}
              className="
                bg-white p-2 rounded-md mb-2 shadow-sm 
                flex flex-col cursor-move 
                border border-blue-100 hover:bg-blue-50 
                group relative
              "
            >
              <div className="flex items-center">
                <Move className="mr-2 text-blue-400 flex-shrink-0" />
                <span className="flex-1">{task.content}</span>
                <button
                  onClick={() => removeTask(task.id, columnId)}
                  className="
                    text-red-500 hover:text-red-700 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity ml-2 flex-shrink-0
                  "
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Task metadata (date, time, calendar link) */}
              {(task.dueDate || task.googleEventLink) && (
                <div className="mt-1 pl-6 text-xs text-gray-500">
                  {task.dueDate && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>
                        {formatDate(task.dueDate)}
                        {task.dueTime && ` at ${task.dueTime}`}
                      </span>
                    </div>
                  )}
                  
                  {task.googleEventLink && (
                    <a 
                      href={task.googleEventLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 mt-1 hover:underline"
                    >
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      View in Calendar
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TasksPanel;