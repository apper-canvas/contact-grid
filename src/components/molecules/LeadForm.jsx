import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import ApperIcon from '@/components/ApperIcon';

function LeadForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name_c: '',
    email_c: '',
    phone_c: '',
    company_c: '',
    position_c: '',
    status_c: 'new',
    source_c: 'website',
    value_c: '',
    notes_c: '',
    tags_c: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name_c: initialData.name_c || '',
        email_c: initialData.email_c || '',
        phone_c: initialData.phone_c || '',
        company_c: initialData.company_c || '',
        position_c: initialData.position_c || '',
        status_c: initialData.status_c || 'new',
        source_c: initialData.source_c || 'website',
        value_c: initialData.value_c || '',
        notes_c: initialData.notes_c || '',
        tags_c: initialData.tags_c || ''
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
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name_c.trim()) {
      newErrors.name_c = 'Name is required';
    }

    if (!formData.email_c.trim()) {
      newErrors.email_c = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_c)) {
      newErrors.email_c = 'Please enter a valid email address';
    }

    if (!formData.company_c.trim()) {
      newErrors.company_c = 'Company is required';
    }

    if (formData.value_c && isNaN(formData.value_c)) {
      newErrors.value_c = 'Value must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert value to number if provided
    const submitData = {
      ...formData,
      value_c: formData.value_c ? parseFloat(formData.value_c) : 0
    };

    onSubmit(submitData);
  };

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' }
  ];

  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'conference', label: 'Conference' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'email_campaign', label: 'Email Campaign' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary rounded-lg">
          <ApperIcon name="UserPlus" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <p className="text-gray-600">
            {initialData ? 'Update lead information' : 'Create a new sales lead'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Full Name"
            value={formData.name_c}
            onChange={handleChange('name_c')}
            error={errors.name_c}
            placeholder="Enter full name"
            required
          />
        </div>
        
        <div>
          <Input
            label="Email"
            type="email"
            value={formData.email_c}
            onChange={handleChange('email_c')}
            error={errors.email_c}
            placeholder="Enter email address"
            required
          />
        </div>
        
        <div>
          <Input
            label="Phone"
            value={formData.phone_c}
            onChange={handleChange('phone_c')}
            error={errors.phone_c}
            placeholder="Enter phone number"
          />
        </div>
        
        <div>
          <Input
            label="Company"
            value={formData.company_c}
            onChange={handleChange('company_c')}
            error={errors.company_c}
            placeholder="Enter company name"
            required
          />
        </div>
        
        <div>
          <Input
            label="Position"
            value={formData.position_c}
            onChange={handleChange('position_c')}
            placeholder="Enter job title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status_c}
            onChange={handleChange('status_c')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source
          </label>
          <select
            value={formData.source_c}
            onChange={handleChange('source_c')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            {sourceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Input
            label="Estimated Value ($)"
            type="number"
            value={formData.value_c}
            onChange={handleChange('value_c')}
            error={errors.value_c}
            placeholder="Enter estimated value"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <Input
          label="Tags"
          value={formData.tags_c}
          onChange={handleChange('tags_c')}
          placeholder="Enter tags separated by commas"
          helpText="Example: hot-lead, enterprise, technology"
        />
      </div>
      
      <div>
        <Textarea
          label="Notes"
          value={formData.notes_c}
          onChange={handleChange('notes_c')}
          placeholder="Add notes about this lead..."
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
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
        >
          {loading ? (
            <>
              <ApperIcon name="Loader2" size={18} className="animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <ApperIcon name="Save" size={18} />
              {initialData ? 'Update Lead' : 'Create Lead'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default LeadForm;