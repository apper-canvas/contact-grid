import { getApperClient } from '@/services/apperClient';

export const getAllCompanies = async (searchTerm = '', sortField = 'Name', sortDirection = 'ASC', page = 1, limit = 20) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "industry_c"}},
        {"field": {"Name": "size_c"}},
        {"field": {"Name": "revenue_c"}},
        {"field": {"Name": "contact_details_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      where: searchTerm ? [{
        "FieldName": "Name",
        "Operator": "Contains",
        "Values": [searchTerm],
        "Include": true
      }] : [],
      orderBy: [{
        "fieldName": sortField,
        "sorttype": sortDirection
      }],
      pagingInfo: {
        "limit": limit,
        "offset": (page - 1) * limit
      }
    };

    const response = await apperClient.fetchRecords('company_c', params);
    
    if (!response?.data?.length) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error?.response?.data?.message || error);
    return [];
  }
};

export const getCompanyById = async (companyId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "industry_c"}},
        {"field": {"Name": "size_c"}},
        {"field": {"Name": "revenue_c"}},
        {"field": {"Name": "contact_details_c"}}
      ]
    };

    const response = await apperClient.getRecordById('company_c', companyId, params);
    return response?.data || null;
  } catch (error) {
    console.error(`Error fetching company ${companyId}:`, error?.response?.data?.message || error);
    return null;
  }
};

export const createCompany = async (companyData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Only include updateable fields
    const params = {
      records: [{
        Name: companyData.Name || '',
        Tags: companyData.Tags || '',
        industry_c: companyData.industry_c || '',
        size_c: companyData.size_c ? parseInt(companyData.size_c) : null,
        revenue_c: companyData.revenue_c ? parseFloat(companyData.revenue_c) : null,
        contact_details_c: companyData.contact_details_c || ''
      }]
    };

    const response = await apperClient.createRecord('company_c', params);

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      if (failed.length > 0) {
        console.error(`Failed to create company: ${failed.map(f => f.message).join(', ')}`);
        throw new Error(failed[0].message);
      }
      return response.results[0].data;
    }
  } catch (error) {
    console.error("Error creating company:", error?.response?.data?.message || error);
    throw error;
  }
};

export const updateCompany = async (companyId, companyData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Only include updateable fields
    const params = {
      records: [{
        Id: companyId,
        Name: companyData.Name || '',
        Tags: companyData.Tags || '',
        industry_c: companyData.industry_c || '',
        size_c: companyData.size_c ? parseInt(companyData.size_c) : null,
        revenue_c: companyData.revenue_c ? parseFloat(companyData.revenue_c) : null,
        contact_details_c: companyData.contact_details_c || ''
      }]
    };

    const response = await apperClient.updateRecord('company_c', params);

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      if (failed.length > 0) {
        console.error(`Failed to update company: ${failed.map(f => f.message).join(', ')}`);
        throw new Error(failed[0].message);
      }
      return response.results[0].data;
    }
  } catch (error) {
    console.error("Error updating company:", error?.response?.data?.message || error);
    throw error;
  }
};

export const deleteCompany = async (companyId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      RecordIds: [companyId]
    };

    const response = await apperClient.deleteRecord('company_c', params);

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      if (failed.length > 0) {
        console.error(`Failed to delete company: ${failed.map(f => f.message).join(', ')}`);
        throw new Error(failed[0].message);
      }
      return true;
    }
  } catch (error) {
    console.error("Error deleting company:", error?.response?.data?.message || error);
    throw error;
  }
};