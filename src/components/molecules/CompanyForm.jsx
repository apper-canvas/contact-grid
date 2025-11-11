import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import ApperIcon from '@/components/ApperIcon';

export default function CompanyForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    revenue: '',
    contactDetails: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.Name || '',
        industry: initialData.industry_c || '',
        size: initialData.size_c?.toString() || '',
        revenue: initialData.revenue_c?.toString() || '',
        contactDetails: initialData.contact_details_c || ''
      });
    }
  }, [initialData]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (formData.size && isNaN(parseInt(formData.size))) {
      newErrors.size = 'Company size must be a number';
    }

    if (formData.revenue && isNaN(parseFloat(formData.revenue))) {
      newErrors.revenue = 'Revenue must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Real Estate',
    'Transportation',
    'Entertainment',
    'Agriculture',
    'Energy',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Company Name *
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Enter company name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
          Industry
        </label>
        <select
          id="industry"
          value={formData.industry}
          onChange={handleChange('industry')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select industry</option>
          {industryOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Size and Revenue Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
            Company Size
          </label>
          <Input
            id="size"
            type="number"
            value={formData.size}
            onChange={handleChange('size')}
            placeholder="Number of employees"
            className={errors.size ? 'border-red-500' : ''}
            min="1"
          />
          {errors.size && (
            <p className="mt-1 text-sm text-red-600">{errors.size}</p>
          )}
        </div>

        <div>
          <label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-2">
            Annual Revenue
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="revenue"
              type="number"
              value={formData.revenue}
              onChange={handleChange('revenue')}
              placeholder="0.00"
              className={`pl-8 ${errors.revenue ? 'border-red-500' : ''}`}
              step="0.01"
              min="0"
            />
          </div>
          {errors.revenue && (
            <p className="mt-1 text-sm text-red-600">{errors.revenue}</p>
          )}
        </div>
      </div>

      {/* Contact Details */}
      <div>
        <label htmlFor="contactDetails" className="block text-sm font-medium text-gray-700 mb-2">
          Contact Details
        </label>
        <Textarea
          id="contactDetails"
          value={formData.contactDetails}
          onChange={handleChange('contactDetails')}
          placeholder="Enter contact information, addresses, or other details..."
          rows={4}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2"
        >
          {loading && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
          <span>{initialData ? 'Update Company' : 'Create Company'}</span>
        </Button>
      </div>
    </form>
  );
}