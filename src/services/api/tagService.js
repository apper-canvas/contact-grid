import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import React from "react";

const TABLE_NAME = 'tag_c';

// Get all available tags
export const getAllTags = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords(TABLE_NAME, {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "label_c"}},
        {"field": {"Name": "color_c"}}
      ],
      orderBy: [{"fieldName": "label_c", "sorttype": "ASC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    // Transform database records to match UI expectations
    return response.data?.map(record => ({
      id: record.Id,
      label: record.label_c || '',
      color: record.color_c || '#3b82f6'
    })) || [];
  } catch (error) {
    console.error("Error fetching tags:", error?.response?.data?.message || error);
    return [];
  }
};

// Get tag color helper function
export const getTagColor = (label) => {
  // Default color mapping for common tags
  const colorMap = {
    'work': '#3b82f6',
    'personal': '#10b981',
    'client': '#f59e0b',
    'prospect': '#8b5cf6',
    'partner': '#ef4444',
    'colleague': '#06b6d4'
  };
  
  return colorMap[label.toLowerCase()] || '#6b7280';
};

// Create new tag
export const createTag = async (tagData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        label_c: tagData.label || '',
        color_c: tagData.color || '#3b82f6'
      }]
    };

    const response = await apperClient.createRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} tags:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        const record = successful[0].data;
        return {
          id: record.Id,
          label: record.label_c || '',
          color: record.color_c || '#3b82f6'
        };
      }
    }
    return null;
} catch (error) {
    console.error("Error creating tag:", error?.response?.data?.message || error);
    return null;
  }
};