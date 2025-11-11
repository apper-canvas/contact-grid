import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import DealCard from './DealCard';

function DealStage({ stage, deals, onDealMove, onEditDeal, onDeleteDeal }) {
  const [dragOver, setDragOver] = useState(false);

  const getStageColor = (stageName) => {
    const colors = {
      'Prospecting': 'bg-blue-100 text-blue-800 border-blue-200',
      'Proposal': 'bg-purple-100 text-purple-800 border-purple-200',
      'Negotiation': 'bg-orange-100 text-orange-800 border-orange-200',
      'Closed Won': 'bg-green-100 text-green-800 border-green-200',
      'Closed Lost': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[stageName] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStageIcon = (stageName) => {
    const icons = {
      'Prospecting': 'Search',
      'Proposal': 'FileText',
      'Negotiation': 'MessageSquare',
      'Closed Won': 'CheckCircle',
      'Closed Lost': 'XCircle'
    };
    return icons[stageName] || 'Circle';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId && onDealMove) {
      onDealMove(parseInt(dealId), stage.Id);
    }
  };

  const stageDeals = deals.filter(deal => deal.deal_stage_c?.Id === stage.Id);
  const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.value_c || 0), 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="flex-1 min-w-80 max-w-96">
      {/* Stage Header */}
      <div className={cn(
        "p-4 rounded-lg border mb-4",
        getStageColor(stage.Name)
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ApperIcon 
              name={getStageIcon(stage.Name)} 
              size={18} 
              className="mr-2" 
            />
            <h2 className="font-semibold text-sm">
              {stage.Name}
            </h2>
          </div>
          <div className="text-xs font-medium">
            {stageDeals.length} {stageDeals.length === 1 ? 'deal' : 'deals'}
          </div>
        </div>
        
        {totalValue > 0 && (
          <div className="mt-2 text-sm font-medium">
            Total: {formatCurrency(totalValue)}
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div
        className={cn(
          "min-h-96 p-3 rounded-lg border-2 border-dashed transition-colors duration-200",
          dragOver 
            ? "border-blue-400 bg-blue-50" 
            : "border-gray-200 bg-gray-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {stageDeals.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <ApperIcon name="Package" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {dragOver ? 'Drop deal here' : 'No deals in this stage'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stageDeals.map(deal => (
              <DealCard
                key={deal.Id}
                deal={deal}
                onEdit={onEditDeal}
                onDelete={onDeleteDeal}
                draggable={true}
              />
            ))}
          </div>
        )}

        {dragOver && (
          <div className="mt-4 p-3 border-2 border-blue-300 border-dashed rounded-lg bg-blue-100 text-blue-600 text-center text-sm">
            <ApperIcon name="ArrowDown" size={16} className="mx-auto mb-1" />
            Drop to move deal to {stage.Name}
          </div>
        )}
      </div>
    </div>
  );
}

export default DealStage;