import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Tag from '@/components/atoms/Tag';
import ApperIcon from '@/components/ApperIcon';
import { getAllTags } from '@/services/api/tagService';

function LeadForm({ initialData, onSubmit, onCancel, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: '',
    status: 'New',
    value: '',
    notes: '',
    tags: []
  });
  
  const [availableTags, setAvailableTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  const statusOptions = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];
  const sourceOptions = ['Website', 'LinkedIn', 'Referral', 'Trade Show', 'Cold Email', 'Social Media', 'Advertisement', 'Other'];

  useEffect(() => {
    loadTags();
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        position: initialData.position || '',
        source: initialData.source || '',
        status: initialData.status || 'New',
        value: initialData.value?.toString() || '',
        notes: initialData.notes || '',
        tags: initialData.tags ? initialData.tags.split(',').map(tag => tag.trim()) : []
      });
    }
  }, [initialData]);

  async function loadTags() {
    try {
      const tags = await getAllTags();
      setAvailableTags(tags || []);
    } catch (error) {
      console.error('Error loading tags:', error);
      setAvailableTags([]);
    }
  }

  function handleChange(field) {
    return (e) => {
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
  }

  function validateForm() {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    
    if (formData.value && isNaN(parseFloat(formData.value))) {
      newErrors.value = 'Please enter a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submitData = {
      ...formData,
      value: formData.value ? parseFloat(formData.value) : 0,
      tags: formData.tags.join(',')
    };
    
    onSubmit(submitData);
  }

  function addTag(tagLabel) {
    const trimmedTag = tagLabel.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
  }

  function removeTag(tagLabel) {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagLabel)
    }));
  }

  function handleNewTagKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newTag.trim()) {
        addTag(newTag);
        setNewTag('');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
          disabled={isSubmitting}
          required
        />
        
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          disabled={isSubmitting}
          required
        />
        
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={handleChange('phone')}
          error={errors.phone}
          disabled={isSubmitting}
        />
        
        <Input
          label="Company"
          value={formData.company}
          onChange={handleChange('company')}
          error={errors.company}
          disabled={isSubmitting}
          required
        />
        
        <Input
          label="Position"
          value={formData.position}
          onChange={handleChange('position')}
          error={errors.position}
          disabled={isSubmitting}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source
          </label>
          <select
            value={formData.source}
            onChange={handleChange('source')}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          >
            <option value="">Select Source</option>
            {sourceOptions.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={handleChange('status')}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <Input
          label="Estimated Value"
          type="number"
          value={formData.value}
          onChange={handleChange('value')}
          error={errors.value}
          disabled={isSubmitting}
          placeholder="0"
        />
      </div>

      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={handleChange('notes')}
        disabled={isSubmitting}
        rows={4}
        placeholder="Add any notes about this lead..."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag, index) => (
              <Tag
                key={index}
                label={tag}
                onRemove={() => removeTag(tag)}
                removable
              />
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleNewTagKeyPress}
            placeholder="Add a tag and press Enter"
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          <Button
            type="button"
            onClick={() => {
              if (newTag.trim()) {
                addTag(newTag);
                setNewTag('');
              }
            }}
            disabled={!newTag.trim() || isSubmitting}
            variant="outline"
          >
            <ApperIcon name="Plus" size={16} />
          </Button>
        </div>
        
        {availableTags.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Suggested tags:</p>
            <div className="flex flex-wrap gap-1">
              {availableTags
                .filter(tag => !formData.tags.includes(tag.label))
                .slice(0, 10)
                .map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addTag(tag.label)}
                    disabled={isSubmitting}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {tag.label}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <ApperIcon name="Loader2" size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <ApperIcon name="Save" size={16} />
              {initialData ? 'Update Lead' : 'Create Lead'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default LeadForm;