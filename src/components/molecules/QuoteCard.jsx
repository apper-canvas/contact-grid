import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const QuoteCard = ({ 
  quote, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
      'Sent': 'bg-blue-100 text-blue-800 border-blue-200',  
      'Accepted': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Draft': 'FileEdit',
      'Sent': 'Send', 
      'Accepted': 'CheckCircle',
      'Rejected': 'XCircle'
    };
    return icons[status] || 'FileText';
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
      month: 'short', 
      day: 'numeric'
    });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 contact-card-hover">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="FileText" size={20} className="text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {quote.Name}
              </h3>
              <p className="text-xs text-gray-500">
                Quote #{quote.Id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
              getStatusColor(quote.status_c)
            )}>
              <ApperIcon 
                name={getStatusIcon(quote.status_c)} 
                size={12} 
                className="mr-1" 
              />
              {quote.status_c}
            </span>
          </div>
        </div>

{/* Customer Info */}
        <div className="mb-4">
          {quote.contact_c && (
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <ApperIcon name="User" size={14} className="mr-2 text-gray-400" />
              <span className="font-medium">{quote.contact_c.Name}</span>
            </div>
          )}
          {quote.company_c && (
            <div className="flex items-center text-sm text-gray-500">
              <ApperIcon name="Building2" size={14} className="mr-2 text-gray-400" />
              <span>{quote.company_c.Name}</span>
            </div>
          )}
        </div>

        {/* Amount and Date */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <ApperIcon name="DollarSign" size={14} className="mr-2 text-green-500" />
              <span className="font-semibold text-green-600">
                {formatCurrency(quote.amount_c)}
              </span>
            </div>
            <div className={cn(
              "flex items-center text-sm",
              isExpired(quote.valid_until_c) 
                ? "text-red-600" 
                : "text-gray-600"
            )}>
              <ApperIcon name="Calendar" size={14} className="mr-2" />
              <span>
                {formatDate(quote.valid_until_c)}
                {isExpired(quote.valid_until_c) && (
                  <span className="ml-1 text-red-500 font-medium">(Expired)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {quote.description_c && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              {truncateText(quote.description_c)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView && onView(quote)}
          >
            <ApperIcon name="Eye" size={14} className="mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm" 
            onClick={() => onEdit(quote)}
          >
            <ApperIcon name="Edit" size={14} className="mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(quote)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <ApperIcon name="Trash2" size={14} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;