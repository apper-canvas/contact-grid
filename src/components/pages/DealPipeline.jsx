import React, { useState, useEffect } from 'react';
import { getAllDeals, updateDeal, deleteDeal, createDeal } from '@/services/api/dealService';
import { getAllStages } from '@/services/api/dealStageService';
import DealStage from '@/components/molecules/DealStage';
import DealForm from '@/components/molecules/DealForm';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Modal from '@/components/atoms/Modal';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import { toast } from 'react-toastify';
function DealPipeline() {
const [deals, setDeals] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dealsData, stagesData] = await Promise.all([
        getAllDeals(),
        getAllStages()
      ]);
      
      setDeals(dealsData);
      setStages(stagesData);
    } catch (err) {
      console.error("Error loading pipeline data:", err);
      setError("Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  };

  const handleDealMove = async (dealId, newStageId) => {
    try {
      const deal = deals.find(d => d.Id === dealId);
      if (!deal) return;

      // Update deal stage
      const updatedDeal = await updateDeal(dealId, {
        ...deal,
        deal_stage_c: newStageId
      });

      if (updatedDeal) {
        // Update local state
        setDeals(prevDeals => 
          prevDeals.map(d => 
            d.Id === dealId 
              ? { ...d, deal_stage_c: { Id: newStageId, Name: stages.find(s => s.Id === newStageId)?.Name } }
              : d
          )
        );
        
        toast.success("Deal moved successfully");
      }
    } catch (error) {
      console.error("Error moving deal:", error);
      toast.error("Failed to move deal");
    }
  };

const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
  };

  const handleAddDeal = () => {
    setIsAddingDeal(true);
  };

  const handleCreateDeal = async (dealData) => {
    setIsCreatingDeal(true);
    try {
      await createDeal(dealData);
      setIsAddingDeal(false);
      await loadData();
      toast.success('Deal created successfully!');
    } catch (error) {
      console.error('Failed to create deal:', error);
      toast.error('Failed to create deal. Please try again.');
    } finally {
      setIsCreatingDeal(false);
    }
  };

  const cancelAddDeal = () => {
    setIsAddingDeal(false);
  };

  const handleDeleteDeal = (deal) => {
    setDealToDelete(deal);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!dealToDelete) return;

    const success = await deleteDeal(dealToDelete.Id);
    
    if (success) {
      setDeals(prevDeals => prevDeals.filter(d => d.Id !== dealToDelete.Id));
      setShowDeleteDialog(false);
      setDealToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDealToDelete(null);
  };

  const getTotalPipelineValue = () => {
    return deals.reduce((sum, deal) => sum + (deal.value_c || 0), 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ApperIcon name="BarChart3" size={28} className="mr-3 text-blue-600" />
              Deal Pipeline
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your sales pipeline and track deal progress
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Pipeline Value</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(getTotalPipelineValue())}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Active Deals</div>
              <div className="text-2xl font-bold text-blue-600">
                {deals.length}
              </div>
            </div>
            
<div className="flex items-center space-x-3">
              <Button 
                onClick={handleAddDeal}
                size="sm"
              >
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Add Deal
              </Button>
              <Button 
                onClick={loadData}
                variant="outline"
                size="sm"
              >
                <ApperIcon name="RefreshCw" size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-hidden">
          <div className="flex gap-6 p-6 h-full min-w-max">
            {stages.map(stage => (
              <DealStage
                key={stage.Id}
                stage={stage}
                deals={deals}
                onDealMove={handleDealMove}
                onEditDeal={handleEditDeal}
                onDeleteDeal={handleDeleteDeal}
              />
            ))}
          </div>
        </div>
      </div>

{/* Add Deal Modal */}
      <Modal
        isOpen={isAddingDeal}
        onClose={cancelAddDeal}
        title="Add New Deal"
      >
        <DealForm
          onSubmit={handleCreateDeal}
          onCancel={cancelAddDeal}
          loading={isCreatingDeal}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Deal"
        message={`Are you sure you want to delete "${dealToDelete?.Name}"? This action cannot be undone.`}
        confirmText="Delete Deal"
        confirmVariant="danger"
      />
    </div>
  );
}

export default DealPipeline;