import React from "react";
import { useOutletContext } from "react-router-dom";
import Modal from "@/components/atoms/Modal";
import ContactList from "@/components/organisms/ContactList";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import ContactTable from "@/components/molecules/ContactTable";
import ContactForm from "@/components/molecules/ContactForm";

const ContactManagement = () => {
  // Get all state and handlers from outlet context
const {
    selectedContact,
    showContactForm,
    editingContact,
    showDeleteDialog,
    contactToDelete,
    showBulkDeleteDialog,
    contactsToDelete,
    loading,
    refreshTrigger,
    handleContactSelect,
    handleAddContact,
    handleEditContact,
    handleDeleteContact,
    handleBulkUpdate,
    handleBulkDelete,
    handleFormSubmit,
    handleFormCancel,
    confirmDelete,
    cancelDelete,
    confirmBulkDelete,
    cancelBulkDelete
  } = useOutletContext();
return (
    <>
<div className="h-full w-full">
        <div className="min-h-[calc(100vh-12rem)] lg:h-[calc(100vh-8rem)] w-full">
          {/* Full Width Contacts Table */}
<ContactList
            selectedContact={selectedContact}
            onContactSelect={handleContactSelect}
            onAddContact={handleAddContact}
            onEdit={handleEditContact}
            onBulkDelete={handleBulkDelete}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
      {/* Contact Form Modal */}
      <Modal
        isOpen={showContactForm}
        onClose={handleFormCancel}
        title={editingContact ? "Edit Contact" : "Add New Contact"}
        size="lg"
      >
        <ContactForm
          initialData={editingContact}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      </Modal>

{/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contactToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Contact"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        type="danger"
        loading={loading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        title="Delete Contacts"
        message={`Are you sure you want to delete ${contactsToDelete.length} contact${contactsToDelete.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmBulkDelete}
        onClose={cancelBulkDelete}
        type="danger"
        loading={loading}
      />
    </>
  );
};

export default ContactManagement;