import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAllCompanies, createCompany, updateCompany, deleteCompany } from '@/services/api/companyService';
import Button from '@/components/atoms/Button';
import Modal from '@/components/atoms/Modal';
import CompanyForm from '@/components/molecules/CompanyForm';
import CompanyStats from '@/components/molecules/CompanyStats';
import CompanyInfo from '@/components/molecules/CompanyInfo';
import AssociatedContacts from '@/components/molecules/AssociatedContacts';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import ApperIcon from '@/components/ApperIcon';

export default function CompanyProfile() {
  const { id } = useParams();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (id && companies.length > 0) {
      const company = companies.find(c => c.Id === parseInt(id));
      setSelectedCompany(company || companies[0]);
    } else if (companies.length > 0) {
      setSelectedCompany(companies[0]);
    }
  }, [id, companies]);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllCompanies();
      setCompanies(result);
      if (result.length === 0) {
        setError('No companies found');
      }
    } catch (err) {
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    setShowForm(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDeleteClick = (company) => {
    setDeletingCompany(company);
    setShowDeleteConfirm(true);
  };

  const handleFormSubmit = async (formData) => {
    let success = false;
    
    if (editingCompany) {
      const updated = await updateCompany(editingCompany.Id, formData);
      if (updated) {
        setCompanies(prev => prev.map(c => c.Id === editingCompany.Id ? updated : c));
        if (selectedCompany?.Id === editingCompany.Id) {
          setSelectedCompany(updated);
        }
        success = true;
      }
    } else {
      const created = await createCompany(formData);
      if (created) {
        setCompanies(prev => [created, ...prev]);
        setSelectedCompany(created);
        success = true;
      }
    }
    
    if (success) {
      setShowForm(false);
      setEditingCompany(null);
    }
  };

  const confirmDelete = async () => {
    if (deletingCompany) {
      const success = await deleteCompany(deletingCompany.Id);
      if (success) {
        setCompanies(prev => prev.filter(c => c.Id !== deletingCompany.Id));
        if (selectedCompany?.Id === deletingCompany.Id) {
          const remaining = companies.filter(c => c.Id !== deletingCompany.Id);
          setSelectedCompany(remaining.length > 0 ? remaining[0] : null);
        }
      }
    }
    setShowDeleteConfirm(false);
    setDeletingCompany(null);
  };

  if (loading) return <Loading />;
  if (error && companies.length === 0) return <ErrorView title="Error" message={error} onRetry={loadCompanies} />;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ApperIcon name="Building" size={24} className="text-primary" />
            <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
          </div>
          <Button onClick={handleAddCompany} className="flex items-center space-x-2">
            <ApperIcon name="Plus" size={16} />
            <span>Add Company</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Company List Sidebar */}
        <div className="w-80 bg-surface border-r border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-2">
            {companies.map((company) => (
              <div
                key={company.Id}
                onClick={() => setSelectedCompany(company)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCompany?.Id === company.Id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <h3 className="font-medium text-gray-900">{company.Name}</h3>
                <p className="text-sm text-gray-500">{company.industry_c || 'No industry specified'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Company Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedCompany ? (
            <div className="p-6 space-y-6">
              <CompanyStats 
                company={selectedCompany} 
                onEdit={() => handleEditCompany(selectedCompany)}
                onDelete={() => handleDeleteClick(selectedCompany)}
              />
              <CompanyInfo company={selectedCompany} />
              <AssociatedContacts companyName={selectedCompany.Name} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ApperIcon name="Building" size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Selected</h3>
                <p className="text-gray-500">Select a company from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingCompany(null); }}
        title={editingCompany ? 'Edit Company' : 'Add New Company'}
      >
        <CompanyForm
          initialData={editingCompany}
          onSubmit={handleFormSubmit}
          onCancel={() => { setShowForm(false); setEditingCompany(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Company"
        message={`Are you sure you want to delete "${deletingCompany?.Name}"? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
}