import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createContact, deleteContact, updateContact } from "@/services/api/contactService";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { useAuth } from "@/layouts/Root";

function Layout() {
const location = useLocation()
  const { user } = useSelector((state) => state.user)
  const { logout } = useAuth()
  
// State declarations
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [contactToDelete, setContactToDelete] = useState(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [contactsToDelete, setContactsToDelete] = useState([])
  const [bulkDeleteClearSelection, setBulkDeleteClearSelection] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

const navigation = [
    { name: 'Contacts', href: '/', icon: 'Users' },
    { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
    { name: 'Deals', href: '/deals', icon: 'TrendingUp' },
    { name: 'Companies', href: '/companies', icon: 'Building2' }
  ]
  // App-level handlers
  const refreshContacts = () => {
    setRefreshTrigger(prev => prev + 1);
  };

const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  // Handle bulk update (edit single selected contact)
  const handleBulkUpdate = (contactIds, clearSelection) => {
    if (contactIds.length === 1) {
      // Find the contact to edit and open edit form
      const contactId = contactIds[0];
      // This will be handled by the ContactList component directly
      // by calling the existing handleEditContact method
      clearSelection();
    }
};

  const handleBulkDelete = (contactIds, clearSelection) => {
    setContactsToDelete(contactIds);
    setBulkDeleteClearSelection(clearSelection);
    setShowBulkDeleteDialog(true);
  };

const handleAddContact = () => {
    setEditingContact(null);
    setShowContactForm(true);
  };

  const handleAddDeal = () => {
// This will be handled by the DealPipeline component through props
    // The actual implementation is in the DealPipeline component
  };

const handleAddTask = () => {
    // This will be handled by task management components
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleDeleteContact = (contact) => {
    setContactToDelete(contact);
    setShowDeleteDialog(true);
  };

  const handleFormSubmit = async (contactData) => {
    setLoading(true);
    
    try {
      let result;
      if (editingContact) {
        result = await updateContact(editingContact.id, contactData);
        if (result.success && result.data) {
          if (selectedContact?.id === editingContact.id) {
            setSelectedContact(result.data);
          }
          toast.success("Contact updated successfully!");
        }
      } else {
        result = await createContact(contactData);
        const newContact = result?.data;
        if (newContact) {
          setSelectedContact(newContact);
          toast.success("Contact added successfully!");
        }
      }
      
      setShowContactForm(false);
      setEditingContact(null);
      refreshContacts();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowContactForm(false);
    setEditingContact(null);
  };

// Confirm bulk delete
  const confirmBulkDelete = async () => {
    if (contactsToDelete.length === 0) return;
    
    setLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

// Process each contact deletion
      for (const contactId of contactsToDelete) {
        const result = await deleteContact(contactId);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} contact${successCount !== 1 ? 's' : ''}`);
        setRefreshTrigger(prev => prev + 1);
        if (bulkDeleteClearSelection) {
          bulkDeleteClearSelection();
        }
      }

      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} contact${errorCount !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete contacts");
    } finally {
      setLoading(false);
      setShowBulkDeleteDialog(false);
      setContactsToDelete([]);
      setBulkDeleteClearSelection(null);
    }
  };

  // Cancel bulk delete
  const cancelBulkDelete = () => {
    setShowBulkDeleteDialog(false);
    setContactsToDelete([]);
    setBulkDeleteClearSelection(null);
  };

const confirmDelete = async () => {
    if (!contactToDelete) return;

    setLoading(true);
    
    try {
      const result = await deleteContact(contactToDelete.id);
      
      if (result.success) {
        if (selectedContact?.id === contactToDelete.id) {
          setSelectedContact(null);
        }
        toast.success("Contact deleted successfully!");
      }
      
      setShowDeleteDialog(false);
      setContactToDelete(null);
      refreshContacts();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const cancelDelete = () => {
setShowDeleteDialog(false);
    setContactToDelete(null);
  };

  // Outlet context to share with child routes
const outletContext = {
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
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Contact Hub</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle navigation menu"
        >
          <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 bg-white shadow-lg border-r border-gray-200 flex-shrink-0 absolute lg:relative z-30 lg:z-auto h-full lg:h-auto`}>
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <div className="relative z-30 bg-white h-full">
          <div className="h-full flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg">
                  <ApperIcon name="Users" size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Contact Hub</h1>
                  <p className="text-xs text-gray-600">Manage efficiently</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
<nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                      location.pathname === item.href 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <ApperIcon name={item.icon} size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Search, Add Contact, and Profile */}
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar - Hidden on mobile, shown on desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ApperIcon name="Search" size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search contacts by name, company, or tags..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors bg-gray-50 hover:bg-white"
                />
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2 lg:space-x-4 lg:ml-6">
{location.pathname === '/deals' ? (
                <button
                  onClick={handleAddDeal}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <ApperIcon name="Plus" size={18} />
                  <span>Add Deal</span>
                </button>
              ) : location.pathname === '/tasks' ? (
                <button
                  onClick={handleAddTask}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <ApperIcon name="Plus" size={18} />
                  <span>Add Task</span>
                </button>
              ) : (
                <button
                  onClick={handleAddContact}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <ApperIcon name="Plus" size={18} />
                  <span>Add Contact</span>
                </button>
              )}
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <ApperIcon name="User" size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName || 'User'}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <ApperIcon name="LogOut" size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
};

export default Layout;