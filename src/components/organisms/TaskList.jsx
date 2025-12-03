import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import TaskCard from "@/components/molecules/TaskCard";
import SortFilter from "@/components/molecules/SortFilter";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";

const TaskList = ({ tasks, onEdit, onDelete, onStatusUpdate }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const handleDeleteClick = (taskId) => {
    const task = tasks.find(t => t.Id === taskId);
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      onDelete(taskToDelete.Id);
      setTaskToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setTaskToDelete(null);
    setShowDeleteDialog(false);
  };

  // Group tasks by status for better organization
  const groupedTasks = tasks.reduce((acc, task) => {
    const statusId = task.status_c?.Id || task.status_c || '1';
    const statusName = task.status_c?.Name || getStatusLabel(statusId);
    
    if (!acc[statusId]) {
      acc[statusId] = {
        name: statusName,
        tasks: [],
        id: statusId
      };
    }
    acc[statusId].tasks.push(task);
    return acc;
  }, {});

  const getStatusLabel = (statusId) => {
    const labels = {
      '1': 'Not Started',
      '2': 'In Progress', 
      '3': 'Completed',
      '4': 'On Hold',
      '5': 'Cancelled'
    };
    return labels[statusId] || 'Unknown';
  };

  const statusOrder = ['1', '2', '4', '3', '5']; // Not Started, In Progress, On Hold, Completed, Cancelled

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-6">
        {/* Show all tasks in a grid if there are few tasks, otherwise group by status */}
        {tasks.length <= 10 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <TaskCard
                key={task.Id}
                task={task}
                onEdit={onEdit}
                onDelete={handleDeleteClick}
                onStatusUpdate={onStatusUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {statusOrder.map(statusId => {
              const group = groupedTasks[statusId];
              if (!group || group.tasks.length === 0) return null;

              return (
                <div key={statusId} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      {group.name}
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        {group.tasks.length}
                      </span>
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.tasks.map(task => (
                      <TaskCard
                        key={task.Id}
                        task={task}
                        onEdit={onEdit}
                        onDelete={handleDeleteClick}
                        onStatusUpdate={onStatusUpdate}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Task"
          message={`Are you sure you want to delete "${taskToDelete?.title_c || 'this task'}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </div>
  );
};

export { TaskList };
export default TaskList;