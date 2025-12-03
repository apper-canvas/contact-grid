import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ApperIcon } from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { SearchBar } from '@/components/molecules/SearchBar';
import { SortFilter } from '@/components/molecules/SortFilter';
import { TaskList } from '@/components/organisms/TaskList';
import { TaskForm } from '@/components/molecules/TaskForm';
import { Modal } from '@/components/atoms/Modal';
import Loading from '@/components/ui/Loading';
import { Empty } from '@/components/ui/Empty';
import ErrorView from '@/components/ui/ErrorView';
import { taskService } from '@/services/api/taskService';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_date_c');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Load tasks from database
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getAll();
      setTasks(data || []);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await taskService.create(taskData);
      toast.success('Task created successfully!');
      setShowTaskForm(false);
      loadTasks(); // Reload to get fresh data
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await taskService.update(editingTask.Id, taskData);
      toast.success('Task updated successfully!');
      setEditingTask(null);
      setShowTaskForm(false);
      loadTasks(); // Reload to get fresh data
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      toast.success('Task deleted successfully!');
      loadTasks(); // Reload to get fresh data
    } catch (error) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleStatusUpdate = async (taskId, newStatusId) => {
    try {
      const task = tasks.find(t => t.Id === taskId);
      if (task) {
        await taskService.update(taskId, {
          ...task,
          status_c: newStatusId,
          completed_date_c: newStatusId === 3 ? new Date().toISOString() : task.completed_date_c
        });
        toast.success('Task status updated!');
        loadTasks(); // Reload to get fresh data
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update task status');
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title_c || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description_c || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || (task.status_c?.Id || task.status_c) == filterStatus;
    const matchesPriority = filterPriority === 'all' || (task.priority_c?.Id || task.priority_c) == filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'title_c':
        return (a.title_c || '').localeCompare(b.title_c || '');
      case 'due_date_c':
        return new Date(a.due_date_c || 0) - new Date(b.due_date_c || 0);
      case 'priority_c':
        const aPriority = a.priority_c?.Id || a.priority_c || 0;
        const bPriority = b.priority_c?.Id || b.priority_c || 0;
        return bPriority - aPriority; // High priority first
      case 'status_c':
        const aStatus = a.status_c?.Name || '';
        const bStatus = b.status_c?.Name || '';
        return aStatus.localeCompare(bStatus);
      default:
        return new Date(b.created_date_c || 0) - new Date(a.created_date_c || 0); // newest first
    }
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: '1', label: 'Not Started' },
    { value: '2', label: 'In Progress' },
    { value: '3', label: 'Completed' },
    { value: '4', label: 'On Hold' },
    { value: '5', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: '1', label: 'Low' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'High' },
    { value: '4', label: 'Critical' }
  ];

  const sortOptions = [
    { value: 'created_date_c', label: 'Date Created' },
    { value: 'title_c', label: 'Title' },
    { value: 'due_date_c', label: 'Due Date' },
    { value: 'priority_c', label: 'Priority' },
    { value: 'status_c', label: 'Status' }
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadTasks} />;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            <p className="text-sm text-gray-600 mt-1">{tasks.length} tasks total</p>
          </div>
          <Button
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 bg-gray-50 px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search tasks by title or description..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="min-w-[140px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px]">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {sortedTasks.length === 0 ? (
          <Empty
            title="No tasks found"
            description={searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
              ? "No tasks match your current filters. Try adjusting your search criteria."
              : "Get started by creating your first task."
            }
            action={
              <Button 
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskForm(true);
                }}
              >
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Add Task
              </Button>
            }
          />
        ) : (
          <TaskList
            tasks={sortedTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <Modal
          isOpen={showTaskForm}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          title={editingTask ? 'Edit Task' : 'Add New Task'}
        >
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleUpdateTask : handleAddTask}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default TaskManagement;