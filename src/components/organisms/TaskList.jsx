import React, { useEffect, useState } from 'react';
import { getAllTasks, searchTasks } from '@/services/api/taskService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import SortFilter from '@/components/molecules/SortFilter';
import TaskCard from '@/components/molecules/TaskCard';
import Empty from '@/components/ui/Empty';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';

function TaskList({ 
  selectedTask, 
  onTaskSelect, 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  refreshTrigger 
}) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'ModifiedOn', direction: 'desc' });

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setFilteredTasks(tasks);
    }
  }, [searchQuery, tasks]);

  useEffect(() => {
    applySorting();
  }, [tasks, sortConfig]);

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTasks();
      setTasks(data);
      setFilteredTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function performSearch() {
    try {
      if (!searchQuery.trim()) {
        setFilteredTasks(tasks);
        return;
      }

      setLoading(true);
      const results = await searchTasks(searchQuery);
      setFilteredTasks(results);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  }

  function applySorting() {
    const sorted = [...filteredTasks].sort((a, b) => {
      let aValue = a[sortConfig.field];
      let bValue = b[sortConfig.field];

      // Handle lookup fields
      if (typeof aValue === 'object' && aValue !== null) {
        aValue = aValue.Name || aValue.name_c || '';
      }
      if (typeof bValue === 'object' && bValue !== null) {
        bValue = bValue.Name || bValue.name_c || '';
      }

      // Handle dates
      if (sortConfig.field.includes('date') || sortConfig.field.includes('On')) {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }

      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredTasks(sorted);
  }

  function handleTaskSelection(taskId, checked) {
    setSelectedTasks(prev => {
      if (checked) {
        return [...prev, taskId];
      } else {
        return prev.filter(id => id !== taskId);
      }
    });
  }

  function handleSelectAll(checked) {
    if (checked) {
      setSelectedTasks(filteredTasks.map(task => task.Id));
    } else {
      setSelectedTasks([]);
    }
  }

  function clearSelection() {
    setSelectedTasks([]);
  }

  const sortOptions = [
    { value: 'Name', label: 'Name' },
    { value: 'due_date_c', label: 'Due Date' },
    { value: 'status_c', label: 'Status' },
    { value: 'priority_c', label: 'Priority' },
    { value: 'CreatedOn', label: 'Created Date' },
    { value: 'ModifiedOn', label: 'Modified Date' }
  ];

  if (loading && tasks.length === 0) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load tasks"
        message={error}
        onRetry={loadTasks}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-surface">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-secondary">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={onAddTask}
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            New Task
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks..."
              onClear={() => setSearchQuery('')}
            />
          </div>
          <SortFilter
            options={sortOptions}
            value={sortConfig.field}
            direction={sortConfig.direction}
            onChange={(field, direction) => setSortConfig({ field, direction })}
          />
        </div>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-secondary">
              {selectedTasks.length} task{selectedTasks.length === 1 ? '' : 's'} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle bulk delete
                  console.log('Bulk delete:', selectedTasks);
                }}
              >
                <ApperIcon name="Trash2" size={14} className="mr-1" />
                Delete Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            {searchQuery ? (
              <Empty
                title="No matching tasks"
                message={`No tasks found for "${searchQuery}"`}
                actionLabel="Clear search"
                onAction={() => setSearchQuery('')}
              />
            ) : (
              <Empty
                title="No tasks yet"
                message="Create your first task to get started with task management"
                actionLabel="Create Task"
                onAction={onAddTask}
              />
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.Id}
                  task={task}
                  isSelected={selectedTask?.Id === task.Id}
                  onClick={onTaskSelect}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  className="h-fit"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selection Controls */}
      {filteredTasks.length > 0 && (
        <div className="flex-shrink-0 p-4 border-t bg-surface">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filteredTasks.length > 0 && selectedTasks.length === filteredTasks.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-secondary">Select all</span>
            </label>
            <span className="text-sm text-secondary">
              {selectedTasks.length} of {filteredTasks.length} selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;