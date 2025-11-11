import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

const TABLE_NAME = 'company_c';

// Get all companies with pagination and filtering
export async function getAllCompanies(filters = {}) {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "industry_c"}},
        {"field": {"Name": "size_c"}},
        {"field": {"Name": "revenue_c"}},
        {"field": {"Name": "contact_details_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}],
      pagingInfo: { limit: 50, offset: 0 }
    };

    if (filters.search) {
      params.where = [{
        "FieldName": "Name",
        "Operator": "Contains",
        "Values": [filters.search],
        "Include": true
      }];
    }

const response = await apperClient.fetchRecords(TABLE_NAME, params);

    // Check for API failure first
    if (!response.success) {
      console.error("API Error fetching companies:", response.message);
      throw new Error(response.message || 'Failed to fetch companies');
    }

    // Handle successful response with no data
    if (!response?.data?.length) {
      console.info("No companies found in database - this may be expected for new installations");
      return [];
    }

    console.info(`Successfully loaded ${response.data.length} companies`);
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error?.response?.data?.message || error);
    // Re-throw error so calling component can distinguish between API failure and empty results
    throw new Error(error.message || 'Failed to load companies');
  }
}

// Get company by ID
export async function getCompanyById(id) {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "industry_c"}},
        {"field": {"Name": "size_c"}},
        {"field": {"Name": "revenue_c"}},
        {"field": {"Name": "contact_details_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ]
    };

    const response = await apperClient.getRecordById(TABLE_NAME, id, params);

    if (!response?.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching company ${id}:`, error?.response?.data?.message || error);
    return null;
  }
}

// Create new company
export async function createCompany(companyData) {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Name: companyData.name || '',
        industry_c: companyData.industry || '',
        size_c: companyData.size ? parseInt(companyData.size) : null,
        revenue_c: companyData.revenue ? parseFloat(companyData.revenue) : null,
        contact_details_c: companyData.contactDetails || ''
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
        console.error(`Failed to create ${failed.length} companies:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success('Company created successfully');
        return successful[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating company:", error?.response?.data?.message || error);
    toast.error('Failed to create company');
    return null;
  }
}

// Update company
export async function updateCompany(id, companyData) {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Id: id,
        Name: companyData.name || '',
        industry_c: companyData.industry || '',
        size_c: companyData.size ? parseInt(companyData.size) : null,
        revenue_c: companyData.revenue ? parseFloat(companyData.revenue) : null,
        contact_details_c: companyData.contactDetails || ''
      }]
    };

    const response = await apperClient.updateRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} companies:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success('Company updated successfully');
        return successful[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating company:", error?.response?.data?.message || error);
    toast.error('Failed to update company');
    return null;
  }
}

// Delete company
export async function deleteCompany(id) {
  try {
    const apperClient = getApperClient();
    
    const params = { 
      RecordIds: [id]
    };

    const response = await apperClient.deleteRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} companies:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success('Company deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting company:", error?.response?.data?.message || error);
    toast.error('Failed to delete company');
    return false;
  }
}