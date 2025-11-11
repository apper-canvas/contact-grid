import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import ApperIcon from '@/components/ApperIcon';
import { getAllTaskStatuses, getAllTaskPriorities } from '@/services/api/taskService';
import { getAllDeals } from '@/services/api/dealService';
import { getAllContacts } from '@/services/api/contactService';

function TaskForm({ initialData = null, onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    Name: '',
    description_c: '',
    due_date_c: '',
    deal_c: '',
    contact_c: '',
    status_c: '',
    priority_c: ''
  });

  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadLookupData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        Name: initialData.Name || '',
        description_c: initialData.description_c || '',
        due_date_c: initialData.due_date_c ? formatDateForInput(initialData.due_date_c) : '',
        deal_c: initialData.deal_c?.Id || initialData.deal_c || '',
        contact_c: initialData.contact_c?.Id || initialData.contact_c || '',
        status_c: initialData.status_c?.Id || initialData.status_c || '',
        priority_c: initialData.priority_c?.Id || initialData.priority_c || ''
      });
    }
  }, [initialData]);

  async function loadLookupData() {
    try {
      setLoading(true);
      const [statusData, priorityData, dealData, contactData] = await Promise.all([
        getAllTaskStatuses(),
        getAllTaskPriorities(),
        getAllDeals(),
        getAllContacts()
      ]);

      setStatuses(statusData);
      setPriorities(priorityData);
      setDeals(dealData);
      setContacts(contactData);
    } catch (error) {
      console.error('Error loading lookup data:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDateForInput(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // Format for datetime-local input
    } catch (error) {
      return '';
    }
  }

  function formatDateForSubmission(dateString) {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString();
    } catch (error) {
      return '';
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
          [field]: ''
        }));
      }
    };
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.Name?.trim()) {
      newErrors.Name = 'Task name is required';
    }

    if (!formData.status_c) {
      newErrors.status_c = 'Status is required';
    }

    if (!formData.priority_c) {
      newErrors.priority_c = 'Priority is required';
    }

    if (formData.due_date_c) {
      const dueDate = new Date(formData.due_date_c);
      if (isNaN(dueDate.getTime())) {
        newErrors.due_date_c = 'Invalid due date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submissionData = {
      ...formData,
      due_date_c: formData.due_date_c ? formatDateForSubmission(formData.due_date_c) : ''
    };

    onSubmit(submissionData);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <ApperIcon name="Loader2" size={24} className="animate-spin text-primary" />
        <span className="ml-2 text-secondary">Loading form data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Name */}
      <div>
        <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-2">
          Task Name *
        </label>
        <Input
          id="taskName"
          type="text"
          value={formData.Name}
          onChange={handleChange('Name')}
          placeholder="Enter task name"
          error={errors.Name}
          disabled={isLoading}
        />
        {errors.Name && (
          <p className="mt-1 text-sm text-error">{errors.Name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description_c}
          onChange={handleChange('description_c')}
          placeholder="Enter task description"
          rows={4}
          disabled={isLoading}
        />
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
          Due Date
        </label>
        <Input
          id="dueDate"
          type="datetime-local"
          value={formData.due_date_c}
          onChange={handleChange('due_date_c')}
          error={errors.due_date_c}
          disabled={isLoading}
        />
        {errors.due_date_c && (
          <p className="mt-1 text-sm text-error">{errors.due_date_c}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status *
        </label>
        <select
          id="status"
          value={formData.status_c}
          onChange={handleChange('status_c')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">Select status</option>
          {statuses.map(status => (
            <option key={status.Id} value={status.Id}>
              {status.name_c || status.Name}
            </option>
          ))}
        </select>
        {errors.status_c && (
          <p className="mt-1 text-sm text-error">{errors.status_c}</p>
        )}
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
          Priority *
        </label>
        <select
          id="priority"
          value={formData.priority_c}
          onChange={handleChange('priority_c')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">Select priority</option>
          {priorities.map(priority => (
            <option key={priority.Id} value={priority.Id}>
              {priority.name_c || priority.Name}
            </option>
          ))}
        </select>
        {errors.priority_c && (
          <p className="mt-1 text-sm text-error">{errors.priority_c}</p>
        )}
      </div>

      {/* Deal */}
      <div>
        <label htmlFor="deal" className="block text-sm font-medium text-gray-700 mb-2">
          Related Deal
        </label>
        <select
          id="deal"
          value={formData.deal_c}
          onChange={handleChange('deal_c')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">Select deal</option>
          {deals.map(deal => (
            <option key={deal.Id} value={deal.Id}>
              {deal.Name}
            </option>
          ))}
        </select>
      </div>

      {/* Contact */}
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
          Related Contact
        </label>
        <select
          id="contact"
          value={formData.contact_c}
          onChange={handleChange('contact_c')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">Select contact</option>
          {contacts.map(contact => (
            <option key={contact.Id} value={contact.Id}>
              {contact.name_c || contact.Name}
            </option>
          ))}
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
          ) : (
            <ApperIcon name="Check" size={16} className="mr-2" />
          )}
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          <ApperIcon name="X" size={16} className="mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default TaskForm;