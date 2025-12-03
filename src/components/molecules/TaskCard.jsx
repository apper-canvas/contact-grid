import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Tag from "@/components/atoms/Tag";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";
const TaskCard = ({ task, onEdit, onDelete, onStatusUpdate, compact = false }) => {
  const priorityColors = {
    '1': 'bg-green-100 text-green-800 border-green-200', // Low
    '2': 'bg-yellow-100 text-yellow-800 border-yellow-200', // Medium
    '3': 'bg-orange-100 text-orange-800 border-orange-200', // High
    '4': 'bg-red-100 text-red-800 border-red-200' // Critical
  };

  const statusColors = {
    '1': 'bg-gray-100 text-gray-800 border-gray-200', // Not Started
    '2': 'bg-blue-100 text-blue-800 border-blue-200', // In Progress
    '3': 'bg-green-100 text-green-800 border-green-200', // Completed
    '4': 'bg-yellow-100 text-yellow-800 border-yellow-200', // On Hold
    '5': 'bg-red-100 text-red-800 border-red-200' // Cancelled
  };

  const statusLabels = {
    '1': 'Not Started',
    '2': 'In Progress',
    '3': 'Completed',
    '4': 'On Hold',
    '5': 'Cancelled'
  };

  const priorityLabels = {
    '1': 'Low',
    '2': 'Medium',
    '3': 'High',
    '4': 'Critical'
  };

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(task.Id, newStatus);
  };

  const getStatusId = () => {
    return task.status_c?.Id || task.status_c || '1';
  };

  const getPriorityId = () => {
    return task.priority_c?.Id || task.priority_c || '2';
  };

  const getStatusName = () => {
    return task.status_c?.Name || statusLabels[getStatusId()] || 'Not Started';
  };

  const getPriorityName = () => {
    return task.priority_c?.Name || priorityLabels[getPriorityId()] || 'Medium';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const isOverdue = () => {
    if (!task.due_date_c || getStatusId() === '3') return false; // Not overdue if completed
    const dueDate = new Date(task.due_date_c);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return dueDate < today;
  };

  const getDaysUntilDue = () => {
    if (!task.due_date_c) return null;
    const dueDate = new Date(task.due_date_c);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const overdue = isOverdue();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${
      overdue ? 'border-red-300 bg-red-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex-1 mr-2">
          {task.title_c || 'Untitled Task'}
        </h3>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            <ApperIcon name="Edit" size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(task.Id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete task"
          >
            <ApperIcon name="Trash2" size={14} />
          </Button>
        </div>
      </div>

      {/* Description */}
      {task.description_c && !compact && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {task.description_c}
        </p>
      )}

      {/* Related Contact/Company */}
      {(task.contact_c || task.company_c) && !compact && (
        <div className="text-xs text-gray-500 mb-3 space-y-1">
          {task.contact_c && (
            <div className="flex items-center">
              <ApperIcon name="User" size={12} className="mr-1" />
              <span>{task.contact_c.Name || `Contact ID: ${task.contact_c}`}</span>
            </div>
          )}
          {task.company_c && (
            <div className="flex items-center">
              <ApperIcon name="Building" size={12} className="mr-1" />
              <span>{task.company_c.Name || `Company ID: ${task.company_c}`}</span>
            </div>
          )}
        </div>
      )}

      {/* Status and Priority */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[getStatusId()]}`}>
          {getStatusName()}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[getPriorityId()]}`}>
          {getPriorityName()} Priority
        </span>
        {task.assigned_to_c && (
          <span className="px-2 py-1 text-xs font-medium rounded-full border bg-blue-50 text-blue-800 border-blue-200">
            <ApperIcon name="UserCheck" size={10} className="mr-1 inline" />
            Assigned
          </span>
        )}
      </div>

      {/* Due Date and Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm">
          <ApperIcon name="Calendar" size={14} className="mr-1" />
          <span className={`${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {formatDate(task.due_date_c)}
            {daysUntilDue !== null && (
              <span className="ml-2">
                {overdue 
                  ? `(${Math.abs(daysUntilDue)} days overdue)`
                  : daysUntilDue === 0 
                  ? '(Due today)' 
                  : `(${daysUntilDue} days left)`
                }
              </span>
            )}
          </span>
        </div>

        {/* Quick Status Actions */}
        {getStatusId() !== '3' && (
          <div className="flex items-center space-x-1">
            {getStatusId() === '1' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('2')}
                className="text-xs px-2 py-1"
                title="Start task"
              >
                <ApperIcon name="Play" size={12} className="mr-1" />
                Start
              </Button>
            )}
            {getStatusId() === '2' && (
              <Button
                size="sm" 
                variant="outline"
                onClick={() => handleStatusChange('3')}
                className="text-xs px-2 py-1 text-green-600 border-green-300 hover:bg-green-50"
                title="Complete task"
              >
                <ApperIcon name="Check" size={12} className="mr-1" />
                Complete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Assigned To */}
      {task.assigned_to_c && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <ApperIcon name="Mail" size={12} className="mr-1" />
            <span>Assigned to: {task.assigned_to_c}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;