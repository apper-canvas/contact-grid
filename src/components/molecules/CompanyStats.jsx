import React from 'react';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

export default function CompanyStats({ company, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{company.Name}</h2>
          <p className="text-gray-500">{company.industry_c || 'Industry not specified'}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Edit2" size={14} />
            <span>Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <ApperIcon name="Trash2" size={14} />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ApperIcon name="Users" size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Company Size</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {company.size_c ? `${company.size_c.toLocaleString()} employees` : 'Not specified'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ApperIcon name="DollarSign" size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-600">Annual Revenue</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(company.revenue_c)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ApperIcon name="Calendar" size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Created</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(company.CreatedOn)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ApperIcon name="Clock" size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Last Updated</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(company.ModifiedOn)}
          </p>
        </div>
      </div>
    </div>
  );
}