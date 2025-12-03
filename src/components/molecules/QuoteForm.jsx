import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import ApperIcon from "@/components/ApperIcon";

const QuoteForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
const [formData, setFormData] = useState({
    Name: "",
    title_c: "",
    description_c: "",
    amount_c: "",
    status_c: "Draft",
    valid_until_c: "",
    quote_date_c: "",
    contact_c: "",
    company_c: ""
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "Draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
    { value: "Sent", label: "Sent", color: "bg-blue-100 text-blue-800" },
    { value: "Accepted", label: "Accepted", color: "bg-green-100 text-green-800" },
    { value: "Rejected", label: "Rejected", color: "bg-red-100 text-red-800" }
  ];

useEffect(() => {
    if (initialData) {
      setFormData({
        Name: initialData.Name || "",
        title_c: initialData.title_c || initialData.Name || "",
        description_c: initialData.description_c || "",
        amount_c: initialData.amount_c || "",
        status_c: initialData.status_c || "Draft",
        valid_until_c: initialData.valid_until_c ? 
          new Date(initialData.valid_until_c).toISOString().split('T')[0] : "",
        quote_date_c: initialData.quote_date_c ? 
          new Date(initialData.quote_date_c).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        contact_c: initialData.contact_c?.Id || initialData.contact_c || "",
        company_c: initialData.company_c?.Id || initialData.company_c || ""
      });
    } else {
      // Set default quote_date_c for new quotes
      setFormData(prev => ({
        ...prev,
        quote_date_c: new Date().toISOString().split('T')[0]
      }));
    }
  }, [initialData]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

const validateForm = () => {
    const newErrors = {};

    if (!formData.Name.trim()) {
      newErrors.Name = "Quote name is required";
    }

    if (!formData.amount_c || formData.amount_c <= 0) {
      newErrors.amount_c = "Amount must be greater than 0";
    }

    if (!formData.valid_until_c) {
      newErrors.valid_until_c = "Valid until date is required";
    } else {
      const selectedDate = new Date(formData.valid_until_c);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.valid_until_c = "Valid until date must be in the future";
      }
    }

    if (!formData.description_c.trim()) {
      newErrors.description_c = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
if (validateForm()) {
      // Format data for submission
      const submitData = {
        Name: formData.Name.trim(),
        title_c: formData.title_c.trim() || formData.Name.trim(),
        description_c: formData.description_c.trim(),
        amount_c: parseFloat(formData.amount_c) || 0,
        status_c: formData.status_c,
        valid_until_c: formData.valid_until_c,
        quote_date_c: formData.quote_date_c,
        contact_c: formData.contact_c ? parseInt(formData.contact_c) : null,
        company_c: formData.company_c ? parseInt(formData.company_c) : null
      };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-2">
      {/* Quote Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quote Name *
        </label>
        <Input
          value={formData.Name}
          onChange={handleChange("Name")}
          placeholder="Enter quote name"
          error={errors.Name}
        />
        {errors.Name && (
          <p className="text-error text-sm mt-1">{errors.Name}</p>
        )}
      </div>

{/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <Input
          value={formData.title_c}
          onChange={handleChange("title_c")}
          placeholder="Enter quote title (optional)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: If empty, will use quote name
        </p>
      </div>

      {/* Amount and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.amount_c}
            onChange={handleChange("amount_c")}
            placeholder="0.00"
            error={errors.amount_c}
          />
          {errors.amount_c && (
            <p className="text-error text-sm mt-1">{errors.amount_c}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status_c}
            onChange={handleChange("status_c")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quote Date
          </label>
          <Input
            type="date"
            value={formData.quote_date_c}
            onChange={handleChange("quote_date_c")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valid Until *
          </label>
          <Input
            type="date"
            value={formData.valid_until_c}
            onChange={handleChange("valid_until_c")}
            error={errors.valid_until_c}
          />
          {errors.valid_until_c && (
            <p className="text-error text-sm mt-1">{errors.valid_until_c}</p>
          )}
        </div>
      </div>

      {/* Customer References */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact ID
          </label>
          <Input
            type="number"
            value={formData.contact_c}
            onChange={handleChange("contact_c")}
            placeholder="Enter contact ID"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: ID of related contact
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company ID
          </label>
          <Input
            type="number"
            value={formData.company_c}
            onChange={handleChange("company_c")}
            placeholder="Enter company ID"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: ID of related company
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <Textarea
          value={formData.description_c}
          onChange={handleChange("description_c")}
          placeholder="Describe the quote details..."
          rows={4}
          error={errors.description_c}
        />
        {errors.description_c && (
          <p className="text-error text-sm mt-1">{errors.description_c}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          icon={initialData ? "Save" : "Plus"}
        >
          {initialData ? "Update Quote" : "Create Quote"}
        </Button>
      </div>
    </form>
  );
};

export default QuoteForm;