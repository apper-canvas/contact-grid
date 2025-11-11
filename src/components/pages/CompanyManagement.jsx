import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Modal from '@/components/atoms/Modal';
import ApperIcon from '@/components/ApperIcon';
import CompanyForm from '@/components/molecules/CompanyForm';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import { getAllCompanies, createCompany, updateCompany, deleteCompany } from '@/services/api/companyService';
import { cn } from '@/utils/cn';

function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('Name');
  const [sortDirection, setSortDirection] = useState('ASC');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, [searchTerm, sortField, sortDirection]);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllCompanies(searchTerm, sortField, sortDirection);
      setCompanies(result);
    } catch (err) {
      setError('Failed to load companies');
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('ASC');
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

  const handleDeleteCompany = (company) => {
    setCompanyToDelete(company);
    setShowDeleteConfirm(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.Id, formData);
        toast.success('Company updated successfully');
      } else {
        await createCompany(formData);
        toast.success('Company created successfully');
      }
      
      setShowForm(false);
      setEditingCompany(null);
      await loadCompanies();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCompany(null);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteCompany(companyToDelete.Id);
      toast.success('Company deleted successfully');
      setShowDeleteConfirm(false);
      setCompanyToDelete(null);
      await loadCompanies();
    } catch (error) {
      toast.error(error.message || 'Failed to delete company');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCompanyToDelete(null);
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatEmployeeCount = (count) => {
    if (!count) return 'N/A';
    return new Intl.NumberFormat('en-US').format(count);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <Button onClick={loadCompanies} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
            <p className="text-gray-600">Manage your company database</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button onClick={handleAddCompany} className="bg-blue-600 hover:bg-blue-700 text-white">
              <ApperIcon name="Plus" size={20} className="mr-2" />
              Add Company
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {companies.length === 0 ? (
          <Empty 
            icon="Building2"
            title="No companies found"
            description={searchTerm ? "No companies match your search criteria" : "Start by adding your first company"}
            action={
              <Button onClick={handleAddCompany} className="bg-blue-600 hover:bg-blue-700 text-white">
                <ApperIcon name="Plus" size={20} className="mr-2" />
                Add Company
              </Button>
            }
          />
        ) : (
          <div className="table-scroll">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('Name')}
                  >
                    <div className="flex items-center">
                      Company Name
                      {sortField === 'Name' && (
                        <ApperIcon 
                          name={sortDirection === 'ASC' ? 'ChevronUp' : 'ChevronDown'} 
                          size={16} 
                          className="ml-1" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('industry_c')}
                  >
                    <div className="flex items-center">
                      Industry
                      {sortField === 'industry_c' && (
                        <ApperIcon 
                          name={sortDirection === 'ASC' ? 'ChevronUp' : 'ChevronDown'} 
                          size={16} 
                          className="ml-1" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('size_c')}
                  >
                    <div className="flex items-center">
                      Size
                      {sortField === 'size_c' && (
                        <ApperIcon 
                          name={sortDirection === 'ASC' ? 'ChevronUp' : 'ChevronDown'} 
                          size={16} 
                          className="ml-1" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('revenue_c')}
                  >
                    <div className="flex items-center">
                      Revenue
                      {sortField === 'revenue_c' && (
                        <ApperIcon 
                          name={sortDirection === 'ASC' ? 'ChevronUp' : 'ChevronDown'} 
                          size={16} 
                          className="ml-1" 
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Details
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.Id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.Name || 'Unnamed Company'}
                        </div>
                        {company.Tags && (
                          <div className="text-xs text-gray-500 mt-1">
                            {company.Tags}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {company.industry_c || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatEmployeeCount(company.size_c)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">
                        {formatCurrency(company.revenue_c)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {company.contact_details_c || 'No contact details'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCompany(company)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ApperIcon name="Edit2" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCompany(company)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Company Form Modal */}
{showForm && (
        <Modal isOpen={true} onClose={handleFormCancel}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFormCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>
            
            <CompanyForm
              initialData={editingCompany}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              submitLabel={editingCompany ? 'Update Company' : 'Create Company'}
              isLoading={formLoading}
            />
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Delete Company"
          message={`Are you sure you want to delete "${companyToDelete?.Name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isLoading={deleteLoading}
          variant="danger"
        />
      )}
    </div>
  );
}

export default CompanyManagement;