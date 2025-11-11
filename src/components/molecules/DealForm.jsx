import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { getAllContacts } from "@/services/api/contactService";
import { getAllStages } from "@/services/api/dealStageService";

const DealForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    Name: "",
    value_c: "",
    contact_c: "",
    deal_stage_c: "",
    progress_c: ""
  });

  const [contacts, setContacts] = useState([]);
  const [stages, setStages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    if (initialData) {
      setFormData({
        Name: initialData.Name || "",
        value_c: initialData.value_c || "",
        contact_c: initialData.contact_c?.Id || initialData.contact_c || "",
        deal_stage_c: initialData.deal_stage_c?.Id || initialData.deal_stage_c || "",
        progress_c: initialData.progress_c || ""
      });
    }
  }, [initialData]);

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [contactsData, stagesData] = await Promise.all([
          getAllContacts(),
          getAllStages()
        ]);
        
        setContacts(Array.isArray(contactsData) ? contactsData : []);
        setStages(Array.isArray(stagesData) ? stagesData : []);
      } catch (error) {
        console.error("Failed to load form options:", error);
        setContacts([]);
        setStages([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

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
      newErrors.Name = "Deal name is required";
    }

    if (!formData.value_c || formData.value_c <= 0) {
      newErrors.value_c = "Deal value must be greater than 0";
    }

    if (!formData.deal_stage_c) {
      newErrors.deal_stage_c = "Deal stage is required";
    }

    const progress = parseFloat(formData.progress_c);
    if (formData.progress_c && (isNaN(progress) || progress < 0 || progress > 100)) {
      newErrors.progress_c = "Progress must be between 0 and 100";
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
        value_c: parseFloat(formData.value_c) || 0,
        contact_c: formData.contact_c ? parseInt(formData.contact_c) : null,
        deal_stage_c: parseInt(formData.deal_stage_c),
        progress_c: formData.progress_c ? parseFloat(formData.progress_c) : 0
      };
      onSubmit(submitData);
    }
  };

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="animate-spin">
            <ApperIcon name="Loader2" size={20} />
          </div>
          <span>Loading form options...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-2">
      {/* Deal Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deal Name *
        </label>
        <Input
          value={formData.Name}
          onChange={handleChange("Name")}
          placeholder="Enter deal name"
          error={errors.Name}
        />
        {errors.Name && (
          <p className="text-error text-sm mt-1">{errors.Name}</p>
        )}
      </div>

      {/* Deal Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deal Value *
        </label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={formData.value_c}
          onChange={handleChange("value_c")}
          placeholder="0.00"
          error={errors.value_c}
        />
        {errors.value_c && (
          <p className="text-error text-sm mt-1">{errors.value_c}</p>
        )}
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact
        </label>
        <select
          value={formData.contact_c}
          onChange={handleChange("contact_c")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select a contact (optional)</option>
          {contacts.map((contact) => (
            <option key={contact.Id} value={contact.Id}>
              {contact.name_c || contact.Name} - {contact.company_c || contact.Company}
            </option>
          ))}
        </select>
      </div>

      {/* Deal Stage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deal Stage *
        </label>
        <select
          value={formData.deal_stage_c}
          onChange={handleChange("deal_stage_c")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.deal_stage_c ? 'border-error' : 'border-gray-300'
          }`}
        >
          <option value="">Select deal stage</option>
          {stages.map((stage) => (
            <option key={stage.Id} value={stage.Id}>
              {stage.Name}
            </option>
          ))}
        </select>
        {errors.deal_stage_c && (
          <p className="text-error text-sm mt-1">{errors.deal_stage_c}</p>
        )}
      </div>

      {/* Progress */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Progress (%)
        </label>
        <Input
          type="number"
          min="0"
          max="100"
          step="1"
          value={formData.progress_c}
          onChange={handleChange("progress_c")}
          placeholder="0"
          error={errors.progress_c}
        />
        {errors.progress_c && (
          <p className="text-error text-sm mt-1">{errors.progress_c}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Enter progress as a percentage (0-100)
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
          {initialData ? "Update Deal" : "Add Deal"}
        </Button>
      </div>
    </form>
  );
};

export default DealForm;