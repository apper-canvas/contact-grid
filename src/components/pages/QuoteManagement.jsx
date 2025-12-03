import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import QuoteList from "@/components/organisms/QuoteList";
import QuoteForm from "@/components/molecules/QuoteForm";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import { createQuote, updateQuote, deleteQuote } from "@/services/api/quoteService";

function QuoteManagement() {
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleAddQuote = () => {
    setSelectedQuote(null);
    setIsCreateModalOpen(true);
  };

  const handleEditQuote = (quote) => {
    setSelectedQuote(quote);
    setIsEditModalOpen(true);
  };

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setIsViewModalOpen(true);
  };

  const handleDeleteQuote = (quote) => {
    setQuoteToDelete(quote);
    setIsDeleteDialogOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedQuote(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedQuote(null);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedQuote(null);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setQuoteToDelete(null);
  };

  const handleCreateSubmit = async (quoteData) => {
    setLoading(true);
    try {
      await createQuote(quoteData);
      toast.success("Quote created successfully!");
      closeCreateModal();
      triggerRefresh();
    } catch (error) {
      console.error("Failed to create quote:", error);
      toast.error("Failed to create quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (quoteData) => {
    if (!selectedQuote) return;

    setLoading(true);
    try {
      await updateQuote(selectedQuote.Id, quoteData);
      toast.success("Quote updated successfully!");
      closeEditModal();
      triggerRefresh();
    } catch (error) {
      console.error("Failed to update quote:", error);
      toast.error("Failed to update quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!quoteToDelete) return;

    try {
      const success = await deleteQuote(quoteToDelete.Id);
      if (success) {
        toast.success("Quote deleted successfully!");
        closeDeleteDialog();
        triggerRefresh();
      } else {
        toast.error("Failed to delete quote.");
      }
    } catch (error) {
      console.error("Failed to delete quote:", error);
      toast.error("Failed to delete quote. Please try again.");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
      'Sent': 'bg-blue-100 text-blue-800 border-blue-200',
      'Accepted': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="FileText" size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Quote Management
              </h1>
              <p className="text-sm text-gray-500">
                Create and manage customer quotes and proposals
              </p>
            </div>
          </div>
          
          <Button onClick={handleAddQuote}>
            <ApperIcon name="Plus" size={18} className="mr-2" />
            Create Quote
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        <QuoteList
          onEdit={handleEditQuote}
          onDelete={handleDeleteQuote}
          onView={handleViewQuote}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Create Quote Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Create New Quote"
      >
        <QuoteForm
          onSubmit={handleCreateSubmit}
          onCancel={closeCreateModal}
          loading={loading}
        />
      </Modal>

      {/* Edit Quote Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Quote"
      >
        <QuoteForm
          initialData={selectedQuote}
          onSubmit={handleEditSubmit}
          onCancel={closeEditModal}
          loading={loading}
        />
      </Modal>

      {/* View Quote Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        title="Quote Details"
      >
        {selectedQuote && (
          <div className="space-y-6">
            {/* Quote Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedQuote.Name}
                </h3>
                <p className="text-sm text-gray-500">Quote #{selectedQuote.Id}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedQuote.status_c)}`}>
                {selectedQuote.status_c}
              </span>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Customer Name
                  </label>
                  <p className="text-sm text-gray-900">{selectedQuote.customer_name_c}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">{selectedQuote.customer_email_c}</p>
                </div>
              </div>
            </div>

            {/* Quote Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Amount
                </label>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(selectedQuote.amount_c)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Valid Until
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedQuote.valid_until_c)}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedQuote.description_c && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </label>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {selectedQuote.description_c}
                </p>
              </div>
            )}

            {/* Items/Services */}
            {selectedQuote.items_c && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Items/Services
                </label>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {selectedQuote.items_c}
                </p>
              </div>
            )}

            {/* Internal Notes */}
            {selectedQuote.notes_c && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Internal Notes
                </label>
                <p className="text-sm text-gray-900 leading-relaxed bg-yellow-50 p-3 rounded-lg">
                  {selectedQuote.notes_c}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  closeViewModal();
                  handleEditQuote(selectedQuote);
                }}
              >
                <ApperIcon name="Edit" size={16} className="mr-2" />
                Edit Quote
              </Button>
              <Button
                variant="secondary"
                onClick={closeViewModal}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Quote"
        message={`Are you sure you want to delete "${quoteToDelete?.Name}"? This action cannot be undone.`}
        confirmText="Delete Quote"
        confirmVariant="danger"
      />
    </div>
  );
}

export default QuoteManagement;