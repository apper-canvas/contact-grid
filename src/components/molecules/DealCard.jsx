import React from 'react';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';

function DealCard({ deal, onEdit, onDelete, draggable = true }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', deal.Id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3",
        "hover:shadow-md transition-shadow duration-200",
        draggable && "cursor-grab active:cursor-grabbing"
      )}
      draggable={draggable}
      onDragStart={handleDragStart}
    >
      {/* Deal Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">
          {deal.Name || 'Untitled Deal'}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit?.(deal)}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
            title="Edit deal"
          >
            <ApperIcon name="Edit" size={14} />
          </button>
          <button
            onClick={() => onDelete?.(deal)}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="Delete deal"
          >
            <ApperIcon name="Trash2" size={14} />
          </button>
        </div>
      </div>

      {/* Deal Value */}
      <div className="mb-3">
        <div className="text-lg font-semibold text-green-600">
          {formatCurrency(deal.value_c)}
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <ApperIcon name="User" size={14} className="mr-2 text-gray-400" />
          <span className="truncate">
            {deal.contact_c?.Name || 'No contact assigned'}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{deal.progress_c || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              getProgressColor(deal.progress_c || 0)
            )}
            style={{ width: `${Math.min(deal.progress_c || 0, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Drag Handle */}
      {draggable && (
        <div className="flex justify-center mt-2 pt-2 border-t border-gray-100">
          <ApperIcon name="GripVertical" size={16} className="text-gray-300" />
        </div>
      )}
    </div>
  );
}

export default DealCard;