import React, { useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { createTask, deleteTask, updateTask } from "@/services/api/taskService";
import Modal from "@/components/atoms/Modal";
import Layout from "@/components/organisms/Layout";
import TaskList from "@/components/organisms/TaskList";
import TaskForm from "@/components/molecules/TaskForm";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";

function TaskManagement() {
  const { user } = useOutletContext() || {};
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Task selection handler
  const handleTaskSelect = useCallback((task) => {
    setSelectedTask(task);
  }, []);

  // Add new task handler
  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setShowTaskForm(true);
  }, []);

  // Edit task handler
  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  }, []);

  // Delete task handler
  const handleDeleteTask = useCallback((task) => {
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  }, []);

  // Form submission handler
  const handleFormSubmit = useCallback(async (taskData) => {
    try {
      setLoading(true);
      
      let result;
      if (editingTask) {
        // Update existing task
        result = await updateTask(editingTask.Id, taskData);
      } else {
        // Create new task
        result = await createTask(taskData);
      }

      if (result) {
        // Refresh the task list
        setRefreshTrigger(prev => prev + 1);
        
        // Close the form
        setShowTaskForm(false);
        setEditingTask(null);
        
        // Update selected task if it was being edited
        if (editingTask && result.Id === editingTask.Id) {
          setSelectedTask(result);
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  }, [editingTask]);

  // Form cancel handler
  const handleFormCancel = useCallback(() => {
    setShowTaskForm(false);
    setEditingTask(null);
  }, []);

  // Confirm delete handler
  const confirmDelete = useCallback(async () => {
    if (!taskToDelete) return;

    try {
      setLoading(true);
      const success = await deleteTask(taskToDelete.Id);
      
      if (success) {
        // Refresh the task list
        setRefreshTrigger(prev => prev + 1);
        
        // Clear selection if deleted task was selected
        if (selectedTask?.Id === taskToDelete.Id) {
          setSelectedTask(null);
        }
        
        // Close dialog
        setShowDeleteDialog(false);
        setTaskToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  }, [taskToDelete, selectedTask]);

  // Cancel delete handler
  const cancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
    setTaskToDelete(null);
  }, []);

  // Context value for Layout component
  const layoutContext = {
    selectedTask,
    showTaskForm,
    editingTask,
    showDeleteDialog,
    taskToDelete,
    loading,
    refreshTrigger,
    handleTaskSelect,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    handleFormSubmit,
    handleFormCancel,
    confirmDelete,
    cancelDelete
  };

  return (
    <Layout context={layoutContext}>
      <div className="h-full flex flex-col">
        {/* Task List */}
        <div className="flex-1 overflow-hidden">
          <TaskList
            selectedTask={selectedTask}
            onTaskSelect={handleTaskSelect}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Task Form Modal */}
        <Modal
          isOpen={showTaskForm}
          onClose={handleFormCancel}
          title={editingTask ? 'Edit Task' : 'Create New Task'}
          size="lg"
        >
          <TaskForm
            initialData={editingTask}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={loading}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Task"
          message={`Are you sure you want to delete "${taskToDelete?.Name || 'this task'}"? This action cannot be undone.`}
          confirmLabel="Delete Task"
          cancelLabel="Cancel"
          variant="danger"
          isLoading={loading}
        />
      </div>
    </Layout>
  );
}

export default TaskManagement;