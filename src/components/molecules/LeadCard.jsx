import React from 'react';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

function LeadCard({ lead, isSelected, onSelect, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      proposal: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      closed_won: 'bg-green-100 text-green-800',
      closed_lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (source) => {
    const icons = {
      website: 'Globe',
      referral: 'Users',
      linkedin: 'Linkedin',
      conference: 'Calendar',
      cold_call: 'Phone',
      email_campaign: 'Mail',
      social_media: 'Share2',
      other: 'HelpCircle'
    };
    return icons[source] || 'HelpCircle';
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatValue = (value) => {
    if (!value || value === 0) return 'Not set';
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer contact-card-hover",
      isSelected && "ring-2 ring-primary border-primary"
    )}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {lead.name_c}
              </h3>
              <p className="text-sm text-gray-600">{lead.position_c}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(lead);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="Edit3" size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lead);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ApperIcon name="Trash2" size={16} />
            </button>
          </div>
        </div>

        {/* Company */}
        <div className="flex items-center space-x-2 mb-3">
          <ApperIcon name="Building2" size={16} className="text-gray-400" />
          <span className="text-sm text-gray-700 truncate">{lead.company_c}</span>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {lead.email_c && (
            <div className="flex items-center space-x-2">
              <ApperIcon name="Mail" size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600 truncate">{lead.email_c}</span>
            </div>
          )}
          {lead.phone_c && (
            <div className="flex items-center space-x-2">
              <ApperIcon name="Phone" size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{lead.phone_c}</span>
            </div>
          )}
        </div>

        {/* Status and Value */}
        <div className="flex items-center justify-between mb-4">
          <span className={cn(
            "px-2 py-1 text-xs font-medium rounded-full",
            getStatusColor(lead.status_c)
          )}>
            {lead.status_c?.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatValue(lead.value_c)}
          </span>
        </div>

        {/* Source */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name={getSourceIcon(lead.source_c)} size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500 capitalize">
              {lead.source_c?.replace('_', ' ')}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(lead.created_at_c)}
          </span>
        </div>

        {/* Tags */}
        {lead.tags_c && (
          <div className="flex flex-wrap gap-1">
            {lead.tags_c.split(',').slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full tag-chip"
              >
                {tag.trim()}
              </span>
            ))}
            {lead.tags_c.split(',').length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{lead.tags_c.split(',').length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadCard;