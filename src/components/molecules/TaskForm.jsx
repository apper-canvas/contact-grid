import React, { useEffect, useState } from "react";
import { getAllCompanies } from "@/services/api/companyService";
import { getAllContacts } from "@/services/api/contactService";
import ApperIcon from "@/components/ApperIcon";
import Textarea from "@/components/atoms/Textarea";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title_c: '',
    description_c: '',
    due_date_c: '',
    status_c: '1', // Not Started
    priority_c: '2', // Medium
    contact_c: '',
    company_c: '',
    assigned_to_c: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    loadContactsAndCompanies();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        title_c: task.title_c || '',
        description_c: task.description_c || '',
        due_date_c: task.due_date_c ? task.due_date_c.split('T')[0] : '',
        status_c: (task.status_c?.Id || task.status_c || '1').toString(),
        priority_c: (task.priority_c?.Id || task.priority_c || '2').toString(),
        contact_c: (task.contact_c?.Id || task.contact_c || '').toString(),
        company_c: (task.company_c?.Id || task.company_c || '').toString(),
        assigned_to_c: task.assigned_to_c || ''
      });
    }
  }, [task]);

const loadContactsAndCompanies = async () => {
    try {
      const [contactData, companyData] = await Promise.all([
        getAllContacts(),
        getAllCompanies()
      ]);
      setContacts(contactData || []);
      setCompanies(companyData || []);
    } catch (error) {
      console.error('Error loading contacts and companies:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title_c?.trim()) {
      newErrors.title_c = 'Title is required';
    }

    if (!formData.due_date_c) {
      newErrors.due_date_c = 'Due date is required';
    } else {
      const dueDate = new Date(formData.due_date_c);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        newErrors.due_date_c = 'Due date cannot be in the past';
      }
    }

    if (!formData.status_c) {
      newErrors.status_c = 'Status is required';
    }

    if (!formData.priority_c) {
      newErrors.priority_c = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        due_date_c: formData.due_date_c ? new Date(formData.due_date_c).toISOString() : null,
        contact_c: formData.contact_c ? parseInt(formData.contact_c) : null,
        company_c: formData.company_c ? parseInt(formData.company_c) : null
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting task:', error);
      setErrors({ submit: 'Failed to save task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: '1', label: 'Not Started' },
    { value: '2', label: 'In Progress' },
    { value: '3', label: 'Completed' },
    { value: '4', label: 'On Hold' },
    { value: '5', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: '1', label: 'Low' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'High' },
    { value: '4', label: 'Critical' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title_c" className="block text-sm font-medium text-gray-700 mb-2">
          Task Title *
        </label>
        <Input
          id="title_c"
          name="title_c"
          type="text"
          value={formData.title_c}
          onChange={handleInputChange}
          placeholder="Enter task title"
          error={errors.title_c}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description_c" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <Textarea
          id="description_c"
          name="description_c"
          value={formData.description_c}
          onChange={handleInputChange}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="due_date_c" className="block text-sm font-medium text-gray-700 mb-2">
          Due Date *
        </label>
        <Input
          id="due_date_c"
          name="due_date_c"
          type="date"
          value={formData.due_date_c}
          onChange={handleInputChange}
          error={errors.due_date_c}
        />
      </div>

      {/* Status and Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <label htmlFor="status_c" className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            id="status_c"
            name="status_c"
            value={formData.status_c}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status_c && (
            <p className="text-red-500 text-sm mt-1">{errors.status_c}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority_c" className="block text-sm font-medium text-gray-700 mb-2">
            Priority *
          </label>
          <select
            id="priority_c"
            name="priority_c"
            value={formData.priority_c}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.priority_c && (
            <p className="text-red-500 text-sm mt-1">{errors.priority_c}</p>
          )}
        </div>
      </div>

      {/* Contact and Company Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact */}
        <div>
          <label htmlFor="contact_c" className="block text-sm font-medium text-gray-700 mb-2">
            Related Contact
          </label>
          <select
            id="contact_c"
            name="contact_c"
            value={formData.contact_c}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select Contact (Optional)</option>
            {contacts.map(contact => (
              <option key={contact.Id} value={contact.Id}>
                {contact.first_name_c} {contact.last_name_c} - {contact.email_c}
              </option>
            ))}
          </select>
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company_c" className="block text-sm font-medium text-gray-700 mb-2">
            Related Company
          </label>
          <select
            id="company_c"
            name="company_c"
            value={formData.company_c}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select Company (Optional)</option>
            {companies.map(company => (
              <option key={company.Id} value={company.Id}>
                {company.name_c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assigned To */}
      <div>
        <label htmlFor="assigned_to_c" className="block text-sm font-medium text-gray-700 mb-2">
          Assigned To
        </label>
        <Input
          id="assigned_to_c"
          name="assigned_to_c"
          type="email"
          value={formData.assigned_to_c}
          onChange={handleInputChange}
          placeholder="Enter email address"
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
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <>
              <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
              {task ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <ApperIcon name={task ? "Save" : "Plus"} size={16} className="mr-2" />
              {task ? 'Update Task' : 'Create Task'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;