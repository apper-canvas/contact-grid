import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/atoms/Modal';
import LeadList from '@/components/organisms/LeadList';
import LeadForm from '@/components/molecules/LeadForm';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import { createLead, updateLead, deleteLead } from '@/services/api/leadService';

function LeadManagement() {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddLead = () => {
    setEditingLead(null);
    setShowLeadForm(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  const handleDeleteLead = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-6">
      <LeadList
        onAddLead={handleAddLead}
        onEditLead={handleEditLead}
        onDeleteLead={handleDeleteLead}
        refreshTrigger={refreshTrigger}
      />

      {/* Lead Form Modal */}
      <Modal isOpen={showLeadForm} onClose={() => setShowLeadForm(false)}>
        <LeadForm
          initialData={editingLead}
          onSubmit={async (formData) => {
            setLoading(true);
            try {
              if (editingLead) {
                await updateLead(editingLead.id, formData);
                toast.success('Lead updated successfully!');
              } else {
                await createLead(formData);
                toast.success('Lead created successfully!');
              }
              setShowLeadForm(false);
              setRefreshTrigger(prev => prev + 1);
            } catch (error) {
              toast.error(error.message);
            } finally {
              setLoading(false);
            }
          }}
          onCancel={() => {
            setShowLeadForm(false);
            setEditingLead(null);
          }}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={async () => {
          if (!leadToDelete) return;
          setLoading(true);
          try {
            await deleteLead(leadToDelete.id);
            toast.success('Lead deleted successfully!');
            setShowDeleteDialog(false);
            setRefreshTrigger(prev => prev + 1);
          } catch (error) {
            toast.error(error.message);
          } finally {
            setLoading(false);
            setLeadToDelete(null);
          }
        }}
        title="Delete Lead"
        message={`Are you sure you want to delete ${leadToDelete?.name_c}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}

export default LeadManagement;