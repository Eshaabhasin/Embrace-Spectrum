import React, { useState, useRef, useEffect } from 'react';
import { X, Check, 
  PlusCircle, Move
} from 'lucide-react';

const TasksPanel = ({
    tasks,
    setTasks,
    newTask,
    setNewTask,
    draggedTask,
    setDraggedTask
  }) => {
    
    const addNewTask = () => {
      if (newTask.trim()) {
        setTasks(prev => ({
          ...prev,
          todo: [...prev.todo, {
            id: `task-${Date.now()}`,
            content: newTask,
            priority: 'medium',
            createdAt: new Date()
          }]
        }));
        setNewTask("");
      }
    };
  
    const removeTask = (taskId, column) => {
      setTasks(prev => ({
        ...prev,
        [column]: prev[column].filter(task => task.id !== taskId)
      }));
    };
  
    const handleDragStart = (e, task, sourceColumn) => {
      setDraggedTask({ task, sourceColumn });
      e.dataTransfer.setData('text/plain', '');
    };
  
    const handleDragOver = (e) => {
      e.preventDefault();
    };
  
    const handleDrop = (e, targetColumn) => {
      e.preventDefault();
      if (!draggedTask) return;
  
      const updatedTasks = { ...tasks };
      const sourceColumnTasks = updatedTasks[draggedTask.sourceColumn].filter(
        t => t.id !== draggedTask.task.id
      );
      updatedTasks[draggedTask.sourceColumn] = sourceColumnTasks;
  
      updatedTasks[targetColumn] = [
        ...updatedTasks[targetColumn], 
        draggedTask.task
      ];
  
      setTasks(updatedTasks);
      setDraggedTask(null);
    };
  
    return (
      <div className="w-1/3 border-l border-blue-200 p-4 bg-blue-50 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-900">Tasks</h2>
          <button 
            onClick={() => {}}
            className="text-blue-600 hover:text-blue-800"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
  
        {/* Task Input */}
        <div className="mb-4 flex">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
            className="flex-1 p-2 border border-blue-200 rounded-l-md focus:ring-2 focus:ring-blue-300"
            onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
          />
          <button 
            onClick={addNewTask}
            className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
  
        {/* Task Columns */}
        {['todo', 'inProgress', 'completed'].map((columnId) => (
          <div 
            key={columnId}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, columnId)}
            className="mb-4 min-h-[100px] border-2 border-dashed border-blue-200 rounded-md p-2"
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
                  flex items-center cursor-move 
                  border border-blue-100 hover:bg-blue-50 
                  group relative
                "
              >
                <Move className="mr-2 text-blue-400" />
                <span className="flex-1">{task.content}</span>
                <button
                  onClick={() => removeTask(task.id, columnId)}
                  className="
                    text-red-500 hover:text-red-700 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity ml-2
                  "
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  export default TasksPanel