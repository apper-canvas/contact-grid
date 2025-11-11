import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

const DEFAULT_STAGES = [
  { Name: 'Prospecting' },
  { Name: 'Proposal' },
  { Name: 'Negotiation' },
  { Name: 'Closed Won' },
  { Name: 'Closed Lost' }
];

export const getAllStages = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('deal_stage_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "CreatedOn"}}
      ],
      orderBy: [{"fieldName": "CreatedOn", "sorttype": "ASC"}]
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    // If no stages exist, create default stages
    if (!response.data || response.data.length === 0) {
      const createdStages = await createDefaultStages();
      return createdStages;
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching deal stages:", error?.response?.data?.message || error);
    toast.error("Failed to load deal stages");
    return [];
  }
};

export const createDefaultStages = async () => {
  try {
    const apperClient = getApperClient();
    
    const payload = {
      records: DEFAULT_STAGES
    };

    const response = await apperClient.createRecord('deal_stage_c', payload);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} stages:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success("Default deal stages created successfully");
        return successful.map(r => r.data);
      }
    }

    return [];
  } catch (error) {
    console.error("Error creating default stages:", error?.response?.data?.message || error);
    toast.error("Failed to create default stages");
    return [];
  }
};

export const getStageById = async (stageId) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.getRecordById('deal_stage_c', stageId, {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "CreatedOn"}}
      ]
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching stage ${stageId}:`, error?.response?.data?.message || error);
    toast.error("Failed to load stage details");
    return null;
  }
};