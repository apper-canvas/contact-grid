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
    customer_name_c: "",
    customer_email_c: "",
    amount_c: "",
    status_c: "Draft",
    valid_until_c: "",
    description_c: "",
    items_c: "",
    notes_c: ""
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
        customer_name_c: initialData.customer_name_c || "",
        customer_email_c: initialData.customer_email_c || "",
        amount_c: initialData.amount_c || "",
        status_c: initialData.status_c || "Draft",
        valid_until_c: initialData.valid_until_c ? 
          new Date(initialData.valid_until_c).toISOString().split('T')[0] : "",
        description_c: initialData.description_c || "",
        items_c: initialData.items_c || "",
        notes_c: initialData.notes_c || ""
      });
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

    if (!formData.customer_name_c.trim()) {
      newErrors.customer_name_c = "Customer name is required";
    }

    if (!formData.customer_email_c.trim()) {
      newErrors.customer_email_c = "Customer email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email_c)) {
      newErrors.customer_email_c = "Please enter a valid email address";
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
        customer_name_c: formData.customer_name_c.trim(),
        customer_email_c: formData.customer_email_c.trim(),
        amount_c: parseFloat(formData.amount_c) || 0,
        status_c: formData.status_c,
        valid_until_c: formData.valid_until_c,
        description_c: formData.description_c.trim(),
        items_c: formData.items_c.trim(),
        notes_c: formData.notes_c.trim()
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

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <Input
            value={formData.customer_name_c}
            onChange={handleChange("customer_name_c")}
            placeholder="Enter customer name"
            error={errors.customer_name_c}
          />
          {errors.customer_name_c && (
            <p className="text-error text-sm mt-1">{errors.customer_name_c}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Email *
          </label>
          <Input
            type="email"
            value={formData.customer_email_c}
            onChange={handleChange("customer_email_c")}
            placeholder="customer@example.com"
            error={errors.customer_email_c}
          />
          {errors.customer_email_c && (
            <p className="text-error text-sm mt-1">{errors.customer_email_c}</p>
          )}
        </div>
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

      {/* Valid Until Date */}
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

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <Textarea
          value={formData.description_c}
          onChange={handleChange("description_c")}
          placeholder="Describe the quote details..."
          rows={3}
          error={errors.description_c}
        />
        {errors.description_c && (
          <p className="text-error text-sm mt-1">{errors.description_c}</p>
        )}
      </div>

      {/* Items/Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Items/Services
        </label>
        <Textarea
          value={formData.items_c}
          onChange={handleChange("items_c")}
          placeholder="List items or services included..."
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: List the items or services included in this quote
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Internal Notes
        </label>
        <Textarea
          value={formData.notes_c}
          onChange={handleChange("notes_c")}
          placeholder="Internal notes about this quote..."
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: Internal notes for team reference
        </p>
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