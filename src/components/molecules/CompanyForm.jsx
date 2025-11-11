import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import ApperIcon from '@/components/ApperIcon';

function CompanyForm({ 
  initialData = null, 
  onSubmit, 
  onCancel,
  submitLabel = 'Save Company',
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    Name: '',
    Tags: '',
    industry_c: '',
    size_c: '',
    revenue_c: '',
    contact_details_c: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        Name: initialData.Name || '',
        Tags: initialData.Tags || '',
        industry_c: initialData.industry_c || '',
        size_c: initialData.size_c || '',
        revenue_c: initialData.revenue_c || '',
        contact_details_c: initialData.contact_details_c || ''
      });
    }
  }, [initialData]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name?.trim()) {
      newErrors.Name = 'Company name is required';
    }
    
    if (formData.size_c && isNaN(parseInt(formData.size_c))) {
      newErrors.size_c = 'Size must be a number';
    }
    
    if (formData.revenue_c && isNaN(parseFloat(formData.revenue_c))) {
      newErrors.revenue_c = 'Revenue must be a valid decimal number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      size_c: formData.size_c ? parseInt(formData.size_c) : null,
      revenue_c: formData.revenue_c ? parseFloat(formData.revenue_c) : null
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Company Name *
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Enter company name"
            value={formData.Name}
            onChange={handleChange('Name')}
            disabled={isLoading}
            className={errors.Name ? 'border-red-500 focus:border-red-500' : ''}
          />
          {errors.Name && (
            <p className="text-sm text-red-600 flex items-center">
              <ApperIcon name="AlertCircle" size={16} className="mr-1" />
              {errors.Name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <Input
            id="industry"
            type="text"
            placeholder="e.g., Technology, Healthcare, Finance"
            value={formData.industry_c}
            onChange={handleChange('industry_c')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">
            Company Size (Employees)
          </label>
          <Input
            id="size"
            type="number"
            placeholder="Number of employees"
            value={formData.size_c}
            onChange={handleChange('size_c')}
            disabled={isLoading}
            className={errors.size_c ? 'border-red-500 focus:border-red-500' : ''}
          />
          {errors.size_c && (
            <p className="text-sm text-red-600 flex items-center">
              <ApperIcon name="AlertCircle" size={16} className="mr-1" />
              {errors.size_c}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="revenue" className="block text-sm font-medium text-gray-700">
            Annual Revenue
          </label>
          <Input
            id="revenue"
            type="number"
            step="0.01"
            placeholder="Annual revenue (USD)"
            value={formData.revenue_c}
            onChange={handleChange('revenue_c')}
            disabled={isLoading}
            className={errors.revenue_c ? 'border-red-500 focus:border-red-500' : ''}
          />
          {errors.revenue_c && (
            <p className="text-sm text-red-600 flex items-center">
              <ApperIcon name="AlertCircle" size={16} className="mr-1" />
              {errors.revenue_c}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <Input
            id="tags"
            type="text"
            placeholder="Comma-separated tags"
            value={formData.Tags}
            onChange={handleChange('Tags')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="contact_details" className="block text-sm font-medium text-gray-700">
            Contact Details
          </label>
          <Textarea
            id="contact_details"
            placeholder="Contact information, addresses, phone numbers, etc."
            value={formData.contact_details_c}
            onChange={handleChange('contact_details_c')}
            disabled={isLoading}
            rows={4}
            className="resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
              {submitLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

export default CompanyForm;