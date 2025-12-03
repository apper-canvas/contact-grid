import React, { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Modal from '@/components/atoms/Modal';
import TaskList from '@/components/organisms/TaskList';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import TaskForm from '@/components/molecules/TaskForm';
import { createTask, updateTask, deleteTask } from '@/services/api/taskService';

function TaskManagement() {
  const { user } = useOutletContext() || {};
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshTasks = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  function handleTaskSelect(task) {
    setSelectedTask(task);
  }

  function handleAddTask() {
    setIsCreateModalOpen(true);
  }

  function handleEditTask(task) {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  }

  function handleDeleteTask(task) {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
    setTaskToEdit(null);
  }

  function closeDeleteDialog() {
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  }

  async function handleCreateSubmit(taskData) {
    try {
      setIsSubmitting(true);
      const newTask = await createTask(taskData);
      
      if (newTask) {
        closeCreateModal();
        refreshTasks();
        setSelectedTask(newTask);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditSubmit(taskData) {
    try {
      setIsSubmitting(true);
      const updatedTask = await updateTask(taskToEdit.Id, taskData);
      
      if (updatedTask) {
        closeEditModal();
        refreshTasks();
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    try {
      setIsSubmitting(true);
      const success = await deleteTask(taskToDelete.Id);
      
      if (success) {
        closeDeleteDialog();
        refreshTasks();
        
        // Clear selection if deleted task was selected
        if (selectedTask?.Id === taskToDelete.Id) {
          setSelectedTask(null);
        }
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-full">
      {/* Main Task List */}
      <TaskList
        selectedTask={selectedTask}
        onTaskSelect={handleTaskSelect}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        refreshTrigger={refreshTrigger}
      />

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSubmit={handleCreateSubmit}
          onCancel={closeCreateModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Task"
        size="lg"
      >
        {taskToEdit && (
          <TaskForm
            initialData={taskToEdit}
            onSubmit={handleEditSubmit}
            onCancel={closeEditModal}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.Name}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default TaskManagement;