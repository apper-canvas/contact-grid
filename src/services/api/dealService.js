import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const getAllDeals = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('deal_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "value_c"}},
        {"field": {"Name": "contact_c"}, "referenceField": {"field": {"Name": "name_c"}}},
        {"field": {"Name": "deal_stage_c"}, "referenceField": {"field": {"Name": "Name"}}},
        {"field": {"Name": "progress_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching deals:", error?.response?.data?.message || error);
    toast.error("Failed to load deals");
    return [];
  }
};

export const getDealById = async (dealId) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.getRecordById('deal_c', dealId, {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "value_c"}},
        {"field": {"Name": "contact_c"}, "referenceField": {"field": {"Name": "name_c"}}},
        {"field": {"Name": "deal_stage_c"}, "referenceField": {"field": {"Name": "Name"}}},
        {"field": {"Name": "progress_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ]
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching deal ${dealId}:`, error?.response?.data?.message || error);
    toast.error("Failed to load deal");
    return null;
  }
};

export const createDeal = async (dealData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare data with only updateable fields and proper formats
    const preparedData = {
      Name: dealData.Name,
      value_c: dealData.value_c ? parseInt(dealData.value_c) : 0,
      contact_c: dealData.contact_c ? parseInt(dealData.contact_c) : null,
      deal_stage_c: dealData.deal_stage_c ? parseInt(dealData.deal_stage_c) : null,
      progress_c: dealData.progress_c ? parseInt(dealData.progress_c) : 0
    };

    // Remove null values
    Object.keys(preparedData).forEach(key => {
      if (preparedData[key] === null || preparedData[key] === undefined) {
        delete preparedData[key];
      }
    });

    const response = await apperClient.createRecord('deal_c', {
      records: [preparedData]
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} deals:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }
      
      return successful.length > 0 ? successful[0].data : null;
    }

    return response.data;
  } catch (error) {
    console.error("Error creating deal:", error?.response?.data?.message || error);
    toast.error("Failed to create deal");
    return null;
  }
};

export const updateDeal = async (dealId, dealData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare data with only updateable fields and proper formats
    const preparedData = {
      Id: parseInt(dealId),
      Name: dealData.Name,
      value_c: dealData.value_c ? parseInt(dealData.value_c) : 0,
      contact_c: dealData.contact_c ? parseInt(dealData.contact_c) : null,
      deal_stage_c: dealData.deal_stage_c ? parseInt(dealData.deal_stage_c) : null,
      progress_c: dealData.progress_c ? parseInt(dealData.progress_c) : 0
    };

    // Remove null values except Id
    Object.keys(preparedData).forEach(key => {
      if (key !== 'Id' && (preparedData[key] === null || preparedData[key] === undefined)) {
        delete preparedData[key];
      }
    });

    const response = await apperClient.updateRecord('deal_c', {
      records: [preparedData]
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} deals:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }
      
      return successful.length > 0 ? successful[0].data : null;
    }

    return response.data;
  } catch (error) {
    console.error("Error updating deal:", error?.response?.data?.message || error);
    toast.error("Failed to update deal");
    return null;
  }
};

export const deleteDeal = async (dealId) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.deleteRecord('deal_c', {
      RecordIds: [parseInt(dealId)]
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} deals:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      return successful.length > 0;
    }

    return true;
  } catch (error) {
    console.error("Error deleting deal:", error?.response?.data?.message || error);
    toast.error("Failed to delete deal");
    return false;
  }
};

export const getDealById = async (dealId) => {
  try {
    const apperClient = getApperClient();
const response = await apperClient.getRecordById('deal_c', dealId, {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "value_c"}},
        {"field": {"Name": "contact_c"}, "referenceField": {"field": {"Name": "name_c"}}},
        {"field": {"Name": "deal_stage_c"}},
        {"field": {"Name": "progress_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ]
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching deal ${dealId}:`, error?.response?.data?.message || error);
    toast.error("Failed to load deal details");
    return null;
  }
};

export const createDeal = async (dealData) => {
  try {
    const apperClient = getApperClient();
    
    // Only include Updateable fields
    const payload = {
      records: [{
        Name: dealData.Name,
        value_c: dealData.value_c ? Number(dealData.value_c) : 0,
        contact_c: dealData.contact_c ? parseInt(dealData.contact_c) : null,
        deal_stage_c: dealData.deal_stage_c ? parseInt(dealData.deal_stage_c) : null,
        progress_c: dealData.progress_c ? Number(dealData.progress_c) : 0
      }]
    };

    const response = await apperClient.createRecord('deal_c', payload);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} deals:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success("Deal created successfully");
        return successful[0].data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error creating deal:", error?.response?.data?.message || error);
    toast.error("Failed to create deal");
    return null;
  }
};

export const updateDeal = async (dealId, dealData) => {
  try {
    const apperClient = getApperClient();
    
    // Only include Updateable fields
    const payload = {
      records: [{
        Id: dealId,
        Name: dealData.Name,
        value_c: dealData.value_c ? Number(dealData.value_c) : 0,
        contact_c: dealData.contact_c ? parseInt(dealData.contact_c) : null,
        deal_stage_c: dealData.deal_stage_c ? parseInt(dealData.deal_stage_c) : null,
        progress_c: dealData.progress_c ? Number(dealData.progress_c) : 0
      }]
    };

    const response = await apperClient.updateRecord('deal_c', payload);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} deals:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success("Deal updated successfully");
        return successful[0].data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error updating deal:", error?.response?.data?.message || error);
    toast.error("Failed to update deal");
    return null;
  }
};

export const deleteDeal = async (dealId) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.deleteRecord('deal_c', {
      RecordIds: [dealId]
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} deals:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success("Deal deleted successfully");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error deleting deal:", error?.response?.data?.message || error);
    toast.error("Failed to delete deal");
    return false;
  }
};