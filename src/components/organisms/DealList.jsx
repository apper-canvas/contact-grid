import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllDeals, deleteDeal } from '@/services/api/dealService';
import { getAllContacts } from '@/services/api/contactService';
import { getAllStages } from '@/services/api/dealStageService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Modal from '@/components/atoms/Modal';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import DealForm from '@/components/molecules/DealForm';
import SortFilter from '@/components/molecules/SortFilter';
import { cn } from '@/utils/cn';

function DealList({ dealsData, contactsData, stagesData, onRefresh, onViewModeChange }) {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('CreatedOn');
  const [sortOrder, setSortOrder] = useState('desc');
  useEffect(() => {
// Use provided data if available, otherwise load data
    if (dealsData && contactsData && stagesData) {
      setDeals(dealsData);
      setContacts(contactsData);
      setStages(stagesData);
      setLoading(false);
    } else {
      loadData();
    }
  }, [dealsData, contactsData, stagesData]);

  useEffect(() => {
    filterAndSortDeals();
  }, [deals, searchTerm, stageFilter, sortBy, sortOrder]);

const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (onRefresh) {
        // If parent provides refresh function, use it
        await onRefresh();
      } else {
        // Otherwise load data directly
        const [dealsData, contactsData, stagesData] = await Promise.all([
          getAllDeals(),
          getAllContacts(),
          getAllStages()
        ]);
        
        setDeals(dealsData);
        setContacts(contactsData);
        setStages(stagesData);
      }
    } catch (err) {
      console.error("Error loading deals data:", err);
      setError("Failed to load deals data");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDeals = () => {
    let filtered = [...deals];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.contact_c?.Name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(deal => 
        deal.deal_stage_c?.Name?.toLowerCase() === stageFilter.toLowerCase()
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'Name':
          aValue = a.Name || '';
          bValue = b.Name || '';
          break;
        case 'value_c':
          aValue = a.value_c || 0;
          bValue = b.value_c || 0;
          break;
        case 'progress_c':
          aValue = a.progress_c || 0;
          bValue = b.progress_c || 0;
          break;
        case 'CreatedOn':
        default:
          aValue = new Date(a.CreatedOn || 0);
          bValue = new Date(b.CreatedOn || 0);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredDeals(filtered);
  };

  const handleCreate = () => {
    setSelectedDeal(null);
    setIsCreating(true);
  };

  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    setIsEditing(true);
  };

  const handleDelete = (deal) => {
    setDealToDelete(deal);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!dealToDelete) return;
    
    try {
      await deleteDeal(dealToDelete.Id);
      toast.success('Deal deleted successfully');
      loadData();
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.error('Failed to delete deal');
    } finally {
      setShowDeleteDialog(false);
      setDealToDelete(null);
    }
  };

const handleFormSubmit = async (formData) => {
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await loadData();
      }
      toast.success(isCreating ? 'Deal created successfully' : 'Deal updated successfully');
      setIsCreating(false);
      setIsEditing(false);
      setSelectedDeal(null);
    } catch (error) {
      console.error("Error saving deal:", error);
      toast.error('Failed to save deal');
    }
  };
  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStageColor = (stageName) => {
    if (!stageName) return 'bg-gray-100 text-gray-800';
    
    const stage = stageName.toLowerCase();
    if (stage.includes('prospect')) return 'bg-blue-100 text-blue-800';
    if (stage.includes('proposal')) return 'bg-purple-100 text-purple-800';
    if (stage.includes('negotiation')) return 'bg-orange-100 text-orange-800';
    if (stage.includes('won')) return 'bg-green-100 text-green-800';
    if (stage.includes('lost')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const sortOptions = [
    { value: 'CreatedOn', label: 'Date Created' },
    { value: 'Name', label: 'Deal Name' },
    { value: 'value_c', label: 'Value' },
    { value: 'progress_c', label: 'Progress' }
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorView title="Error" message={error} onRetry={loadData} />;

return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ApperIcon name="List" size={28} className="mr-3 text-blue-600" />
              Deals List
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all your deals in a comprehensive table format
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle - Show Pipeline Option */}
            {onViewModeChange && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange('pipeline')}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900"
                >
                  <ApperIcon name="BarChart3" size={16} className="mr-2" />
                  Pipeline
                </button>
                <button
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm"
                >
                  <ApperIcon name="List" size={16} className="mr-2" />
                  List
                </button>
              </div>
            )}
            
            <Button onClick={handleCreate} className="bg-primary text-white hover:bg-primary/90">
              <ApperIcon name="Plus" size={18} className="mr-2" />
              Add Deal
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              placeholder="Search deals by name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon="Search"
            />
          </div>
          
          <div className="flex gap-4 items-center">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Stages</option>
              {stages.map(stage => (
                <option key={stage.Id} value={stage.Name}>{stage.Name}</option>
              ))}
            </select>
            
            <SortFilter 
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(field, order) => {
                setSortBy(field);
                setSortOrder(order);
              }}
              options={sortOptions}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <span>Total Deals: <strong>{deals.length}</strong></span>
          <span>Filtered: <strong>{filteredDeals.length}</strong></span>
          <span>
            Total Value: <strong>
              {formatCurrency(filteredDeals.reduce((sum, deal) => sum + (deal.value_c || 0), 0))}
            </strong>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        {filteredDeals.length === 0 && !loading ? (
          <Empty 
            title="No deals found"
            message={searchTerm || stageFilter !== 'all' ? "No deals match your current filters" : "Get started by creating your first deal"}
          />
        ) : (
          <div className="table-scroll">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deal Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeals.map((deal) => (
                    <tr 
                      key={deal.Id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {deal.Name || 'Untitled Deal'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {deal.contact_c?.Name || 'No contact'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(deal.value_c)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          getStageColor(deal.deal_stage_c?.Name)
                        )}>
                          {deal.deal_stage_c?.Name || 'No stage'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full transition-all duration-300", getProgressColor(deal.progress_c))}
                            style={{ width: `${Math.min(100, Math.max(0, deal.progress_c || 0))}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {deal.progress_c || 0}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(deal.CreatedOn)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(deal)}
                            className="text-primary hover:text-primary/80 p-1 rounded-full hover:bg-primary/10 transition-colors"
                            title="Edit deal"
                          >
                            <ApperIcon name="Edit2" size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(deal)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete deal"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Deal Modal */}
      <Modal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create New Deal"
      >
        <DealForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsCreating(false)}
          contacts={contacts}
          stages={stages}
        />
      </Modal>

      {/* Edit Deal Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Deal"
      >
        <DealForm
          initialData={selectedDeal}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsEditing(false)}
          contacts={contacts}
          stages={stages}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Deal"
        message={`Are you sure you want to delete "${dealToDelete?.Name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

export default DealList;