import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllQuotes = async () => {
  await delay(300);
  
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      console.error("ApperClient not initialized");
      return [];
    }

    const response = await apperClient.fetchRecords('quote_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "title_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "amount_c"}},
        {"field": {"Name": "valid_until_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "quote_date_c"}},
        {"field": {"Name": "contact_c"}},
        {"field": {"Name": "company_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}]
    });

    if (!response.success) {
      console.error("Error fetching quotes:", response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
};

export const getQuoteById = async (id) => {
  await delay(200);
  
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      console.error("ApperClient not initialized");
      return null;
    }

    const response = await apperClient.getRecordById('quote_c', parseInt(id), {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "title_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "amount_c"}},
        {"field": {"Name": "valid_until_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "quote_date_c"}},
        {"field": {"Name": "contact_c"}},
        {"field": {"Name": "company_c"}}
      ]
    });

    if (!response.success) {
      console.error("Error fetching quote:", response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching quote:", error);
    return null;
  }
};

export const createQuote = async (quoteData) => {
  await delay(400);
  
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    // Prepare data with only Updateable fields
    const params = {
      records: [{
        Name: quoteData.Name,
        title_c: quoteData.title_c || quoteData.Name,
        description_c: quoteData.description_c,
        amount_c: parseFloat(quoteData.amount_c) || 0,
        status_c: quoteData.status_c,
        valid_until_c: quoteData.valid_until_c,
        quote_date_c: quoteData.quote_date_c || new Date().toISOString(),
        contact_c: quoteData.contact_c ? parseInt(quoteData.contact_c) : null,
        company_c: quoteData.company_c ? parseInt(quoteData.company_c) : null
      }]
    };

    const response = await apperClient.createRecord('quote_c', params);

    if (!response.success) {
      console.error("Error creating quote:", response.message);
      toast.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      if (failed.length > 0) {
        console.error(`Failed to create quote:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
        throw new Error("Failed to create quote");
      }
      return response.results[0]?.data;
    }

    return response.data;
  } catch (error) {
    console.error("Error creating quote:", error);
    throw error;
  }
};

export const updateQuote = async (id, updateData) => {
  await delay(350);
  
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    // Prepare data with only Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: updateData.Name,
        title_c: updateData.title_c || updateData.Name,
        description_c: updateData.description_c,
        amount_c: parseFloat(updateData.amount_c) || 0,
        status_c: updateData.status_c,
        valid_until_c: updateData.valid_until_c,
        quote_date_c: updateData.quote_date_c,
        contact_c: updateData.contact_c ? parseInt(updateData.contact_c) : null,
        company_c: updateData.company_c ? parseInt(updateData.company_c) : null
      }]
    };

    const response = await apperClient.updateRecord('quote_c', params);

    if (!response.success) {
      console.error("Error updating quote:", response.message);
      toast.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      if (failed.length > 0) {
        console.error(`Failed to update quote:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
        throw new Error("Failed to update quote");
      }
      return response.results[0]?.data;
    }

    return response.data;
  } catch (error) {
    console.error("Error updating quote:", error);
    throw error;
  }
};

export const deleteQuote = async (id) => {
  await delay(250);
  
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      console.error("ApperClient not initialized");
      return false;
    }

    const response = await apperClient.deleteRecord('quote_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error("Error deleting quote:", response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      if (failed.length > 0) {
        console.error(`Failed to delete quote:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error deleting quote:", error);
    return false;
  }
};

export const getQuotesByStatus = async (status) => {
  await delay(300);
  
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      console.error("ApperClient not initialized");
      return [];
    }

    const response = await apperClient.fetchRecords('quote_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "title_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "amount_c"}},
        {"field": {"Name": "valid_until_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "contact_c"}},
        {"field": {"Name": "company_c"}}
      ],
      where: [{
        "FieldName": "status_c",
        "Operator": "EqualTo",
        "Values": [status]
      }]
    });

    if (!response.success) {
      console.error("Error fetching quotes by status:", response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching quotes by status:", error);
    return [];
  }
};

export const searchQuotes = async (searchTerm) => {
  await delay(250);
  
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      console.error("ApperClient not initialized");
      return [];
    }

    if (!searchTerm) {
      return getAllQuotes();
    }

    const response = await apperClient.fetchRecords('quote_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "title_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "amount_c"}},
        {"field": {"Name": "valid_until_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "contact_c"}},
        {"field": {"Name": "company_c"}}
      ],
      whereGroups: [{
        "operator": "OR",
        "subGroups": [{
          "conditions": [
            {
              "fieldName": "Name",
              "operator": "Contains",
              "values": [searchTerm]
            },
            {
              "fieldName": "title_c",
              "operator": "Contains", 
              "values": [searchTerm]
            },
            {
              "fieldName": "description_c",
              "operator": "Contains",
              "values": [searchTerm]
            }
          ],
          "operator": "OR"
        }]
      }]
    });

    if (!response.success) {
      console.error("Error searching quotes:", response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error searching quotes:", error);
    return [];
  }
};