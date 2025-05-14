import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, Edit, Plus, CheckSquare, Save, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Onboarding from '../components/Onboarding';
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { Task } from '../types';
import toast from 'react-hot-toast';

const Tasks: React.FC = () => {
  const { currentUser, isFirstTimeUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedTasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedTasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    
    try {
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        starred: false,
        completed: false,
        createdAt: new Date().toISOString(),
        userId: currentUser?.uid
      };
      
      await addDoc(collection(db, 'tasks'), taskData);
      setNewTask({ title: '', description: '' });
      setShowNewTaskForm(false);
      toast.success('Task added');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleToggleStar = async (taskId: string, currentStarred: boolean) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        starred: !currentStarred
      });
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, starred: !currentStarred } : task
      ));
      
      toast.success(currentStarred ? 'Task unstarred' : 'Task starred');
    } catch (error) {
      console.error('Error updating task star:', error);
      toast.error('Failed to update task');
    }
  };

  const handleToggleComplete = async (taskId: string, currentCompleted: boolean) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const completedAt = !currentCompleted ? new Date().toISOString() : null;
      
      await updateDoc(taskRef, {
        completed: !currentCompleted,
        completedAt
      });
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !currentCompleted, completedAt } : task
      ));
      
      toast.success(!currentCompleted ? 'Task completed' : 'Task uncompleted');
    } catch (error) {
      console.error('Error updating task completion:', error);
      toast.error('Failed to update task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditTaskId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || ''
    });
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.title.trim() || !editTaskId) {
      toast.error('Task title is required');
      return;
    }
    
    try {
      const taskRef = doc(db, 'tasks', editTaskId);
      await updateDoc(taskRef, {
        title: editForm.title.trim(),
        description: editForm.description.trim()
      });
      
      setTasks(tasks.map(task => 
        task.id === editTaskId 
          ? { ...task, title: editForm.title, description: editForm.description } 
          : task
      ));
      
      setEditTaskId(null);
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const cancelEdit = () => {
    setEditTaskId(null);
  };

  const renderTaskList = (completed: boolean) => {
    const filteredTasks = tasks.filter(task => task.completed === completed);

    if (filteredTasks.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">{completed ? 'No completed tasks' : 'No pending tasks'}</p>
        </div>
      );
    }

    return (
      <AnimatePresence>
        {filteredTasks.map((task) => (
          <motion.div 
            key={task.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-lg shadow-md-soft mb-3 overflow-hidden ${
              task.starred ? 'border-l-4 border-primary-500' : ''
            }`}
          >
            {editTaskId === task.id ? (
              <form onSubmit={handleUpdateTask} className="p-4">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full mb-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Task title"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full mb-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[60px]"
                  placeholder="Description (optional)"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                  <button
                    type="submit"
                    className="p-2 text-primary-500 hover:text-primary-600"
                  >
                    <Save size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4">
                <div className="flex items-start">
                  <button
                    onClick={() => handleToggleComplete(task.id, task.completed)}
                    className={`flex-shrink-0 p-1 rounded-full mr-3 ${
                      task.completed 
                        ? 'text-green-500 hover:text-green-600' 
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    <CheckCircle size={20} fill={task.completed ? 'currentColor' : 'none'} />
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleToggleStar(task.id, task.starred)}
                      className={`p-1 rounded-full ${
                        task.starred 
                          ? 'text-primary-500 hover:text-primary-600' 
                          : 'text-gray-400 hover:text-gray-500'
                      }`}
                    >
                      <Star size={18} fill={task.starred ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-1 text-gray-400 hover:text-gray-500 rounded-full"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-gray-400 hover:text-gray-500 rounded-full"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="My Tasks" />
      
      <div className="container mx-auto px-4 py-6">
        {showNewTaskForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-md-soft p-4 mb-6"
          >
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
                className="w-full mb-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Description (optional)"
                className="w-full mb-3 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[80px]"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-md hover:opacity-90"
                >
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setShowNewTaskForm(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center w-full py-3 mb-6 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Plus size={20} className="mr-2 text-primary-500" />
            <span>Add New Task</span>
          </motion.button>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Pending Tasks</h2>
              {renderTaskList(false)}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-3">Completed Tasks</h2>
              {renderTaskList(true)}
            </div>
          </>
        )}
      </div>
      
      <Navbar />
      
      {isFirstTimeUser && <Onboarding />}
    </div>
  );
};

export default Tasks;