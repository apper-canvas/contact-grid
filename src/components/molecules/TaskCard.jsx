import React from 'react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Tag from '@/components/atoms/Tag';
import { cn } from '@/utils/cn';

function TaskCard({ 
  task, 
  isSelected = false, 
  onClick, 
  onEdit, 
  onDelete,
  className = '' 
}) {
  const dueDate = task.due_date_c ? new Date(task.due_date_c) : null;
  const isOverdue = dueDate && isPast(dueDate);
  const statusName = task.status_c?.name_c || task.status_c?.Name || 'No Status';
  const priorityName = task.priority_c?.name_c || task.priority_c?.Name || 'No Priority';
  const dealName = task.deal_c?.Name || null;
  const contactName = task.contact_c?.name_c || task.contact_c?.Name || null;

  function formatDate(dateString) {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return null;
    }
  }

  function formatRelativeDate(dateString) {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return null;
    }
  }

  function getPriorityColor(priority) {
    const priorityLower = priority.toLowerCase();
    if (priorityLower.includes('high') || priorityLower.includes('urgent')) {
      return 'text-error bg-red-50 border-red-200';
    }
    if (priorityLower.includes('medium') || priorityLower.includes('normal')) {
      return 'text-warning bg-yellow-50 border-yellow-200';
    }
    return 'text-success bg-green-50 border-green-200';
  }

  function getStatusColor(status) {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('done') || statusLower.includes('completed') || statusLower.includes('finished')) {
      return 'text-success bg-green-50 border-green-200';
    }
    if (statusLower.includes('progress') || statusLower.includes('working') || statusLower.includes('active')) {
      return 'text-info bg-blue-50 border-blue-200';
    }
    if (statusLower.includes('todo') || statusLower.includes('pending') || statusLower.includes('new')) {
      return 'text-secondary bg-gray-50 border-gray-200';
    }
    return 'text-secondary bg-gray-50 border-gray-200';
  }

  return (
    <div
      className={cn(
        'bg-surface border border-gray-200 rounded-lg p-4 transition-all duration-200 cursor-pointer contact-card-hover',
        isSelected && 'ring-2 ring-primary border-primary bg-blue-50',
        isOverdue && 'border-l-4 border-l-error',
        className
      )}
      onClick={() => onClick?.(task)}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {task.Name || 'Untitled Task'}
          </h3>
          {task.description_c && (
            <p className="text-sm text-secondary mt-1 line-clamp-2">
              {task.description_c}
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 ml-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task);
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 text-secondary hover:text-primary transition-colors"
            title="Edit task"
          >
            <ApperIcon name="Edit3" size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(task);
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 text-secondary hover:text-error transition-colors"
            title="Delete task"
          >
            <ApperIcon name="Trash2" size={16} />
          </button>
        </div>
      </div>

      {/* Task Metadata */}
      <div className="space-y-2">
        {/* Status and Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          <Tag 
            label={statusName} 
            variant="outline" 
            className={cn('text-xs px-2 py-1', getStatusColor(statusName))}
          />
          <Tag 
            label={priorityName} 
            variant="outline" 
            className={cn('text-xs px-2 py-1', getPriorityColor(priorityName))}
          />
        </div>

        {/* Due Date */}
        {dueDate && (
          <div className={cn(
            'flex items-center text-sm',
            isOverdue ? 'text-error' : 'text-secondary'
          )}>
            <ApperIcon 
              name={isOverdue ? "AlertTriangle" : "Calendar"} 
              size={14} 
              className="mr-1" 
            />
            <span className="font-medium">
              {isOverdue ? 'Overdue: ' : 'Due: '}
            </span>
            <span>{formatDate(task.due_date_c)}</span>
            <span className="ml-1 text-xs">
              ({formatRelativeDate(task.due_date_c)})
            </span>
          </div>
        )}

        {/* Related Deal */}
        {dealName && (
          <div className="flex items-center text-sm text-secondary">
            <ApperIcon name="FileText" size={14} className="mr-1" />
            <span>Deal: {dealName}</span>
          </div>
        )}

        {/* Related Contact */}
        {contactName && (
          <div className="flex items-center text-sm text-secondary">
            <ApperIcon name="User" size={14} className="mr-1" />
            <span>Contact: {contactName}</span>
          </div>
        )}

        {/* Created/Modified Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <span>
            Created {formatRelativeDate(task.CreatedOn)}
          </span>
          {task.ModifiedOn && task.ModifiedOn !== task.CreatedOn && (
            <span>
              Updated {formatRelativeDate(task.ModifiedOn)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;