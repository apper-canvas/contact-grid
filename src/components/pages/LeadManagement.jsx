import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/atoms/Modal';
import LeadList from '@/components/organisms/LeadList';
import LeadForm from '@/components/molecules/LeadForm';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import { createLead, updateLead, deleteLead } from '@/services/api/leadService';

function LeadManagement() {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [clearSelectionCallback, setClearSelectionCallback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshLeads = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
  };

  const handleBulkUpdate = (leadIds, clearSelection) => {
    // For bulk updates, we could show a simplified form
    // For now, just show a message
    toast.info('Bulk update feature coming soon');
    clearSelection();
  };

  const handleBulkDelete = (leadIds, clearSelection) => {
    setSelectedLeadIds(leadIds);
    setClearSelectionCallback(() => clearSelection);
    setShowBulkDeleteDialog(true);
  };

  const handleAddLead = () => {
    setShowAddModal(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowEditModal(true);
  };

  const handleDeleteLead = (lead) => {
    setDeletingLead(lead);
    setShowDeleteDialog(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingLead) {
        await updateLead(editingLead.id, formData);
        toast.success('Lead updated successfully');
        setShowEditModal(false);
        setEditingLead(null);
      } else {
        await createLead(formData);
        toast.success('Lead created successfully');
        setShowAddModal(false);
      }
      refreshLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error(error.message || 'Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingLead(null);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = selectedLeadIds.map(id => deleteLead(id));
      await Promise.all(deletePromises);
      toast.success(`${selectedLeadIds.length} lead${selectedLeadIds.length !== 1 ? 's' : ''} deleted successfully`);
      setShowBulkDeleteDialog(false);
      setSelectedLeadIds([]);
      if (clearSelectionCallback) {
        clearSelectionCallback();
        setClearSelectionCallback(null);
      }
      refreshLeads();
    } catch (error) {
      console.error('Error deleting leads:', error);
      toast.error('Failed to delete leads');
    }
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteDialog(false);
    setSelectedLeadIds([]);
    setClearSelectionCallback(null);
  };

  const confirmDelete = async () => {
    if (!deletingLead) return;
    
    try {
      await deleteLead(deletingLead.id);
      toast.success('Lead deleted successfully');
      setShowDeleteDialog(false);
      setDeletingLead(null);
      if (selectedLead && selectedLead.id === deletingLead.id) {
        setSelectedLead(null);
      }
      refreshLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingLead(null);
  };

  return (
    <div className="h-full bg-gray-50">
      <LeadList
        selectedLead={selectedLead}
        onLeadSelect={handleLeadSelect}
        onAddLead={handleAddLead}
        onEditLead={handleEditLead}
        onDeleteLead={handleDeleteLead}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        refreshTrigger={refreshTrigger}
      />

      {/* Add Lead Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleFormCancel}
        title="Add New Lead"
        size="lg"
      >
        <LeadForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleFormCancel}
        title="Edit Lead"
        size="lg"
      >
        <LeadForm
          initialData={editingLead}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deletingLead?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        onConfirm={confirmBulkDelete}
        onCancel={cancelBulkDelete}
        title="Delete Multiple Leads"
        message={`Are you sure you want to delete ${selectedLeadIds.length} lead${selectedLeadIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

export default LeadManagement;