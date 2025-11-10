import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

const TABLE_NAME = 'contact_c';

// Get all contacts
export const getAllContacts = async () => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords(TABLE_NAME, {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "email_c"}},
        {"field": {"Name": "phone_c"}},
        {"field": {"Name": "company_c"}},
        {"field": {"Name": "position_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "tags_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "updated_at_c"}}
      ],
      orderBy: [{"fieldName": "created_at_c", "sorttype": "DESC"}],
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
      name: record.name_c || '',
      email: record.email_c || '',
      phone: record.phone_c || '',
      company: record.company_c || '',
      position: record.position_c || '',
      notes: record.notes_c || '',
      tags: record.tags_c ? record.tags_c.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      createdAt: record.created_at_c || new Date().toISOString(),
      updatedAt: record.updated_at_c || new Date().toISOString()
    })) || [];
  } catch (error) {
    console.error("Error fetching contacts:", error?.response?.data?.message || error);
    return [];
  }
};

// Get contact by ID
export const getContactById = async (id) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "email_c"}},
        {"field": {"Name": "phone_c"}},
        {"field": {"Name": "company_c"}},
        {"field": {"Name": "position_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "tags_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "updated_at_c"}}
      ]
    });

    if (!response.success) {
      console.error(response.message);
      return null;
    }

    const record = response.data;
    if (!record) return null;

    // Transform database record to match UI expectations
    return {
      id: record.Id,
      name: record.name_c || '',
      email: record.email_c || '',
      phone: record.phone_c || '',
      company: record.company_c || '',
      position: record.position_c || '',
      notes: record.notes_c || '',
      tags: record.tags_c ? record.tags_c.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      createdAt: record.created_at_c || new Date().toISOString(),
      updatedAt: record.updated_at_c || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching contact ${id}:`, error?.response?.data?.message || error);
    return null;
  }
};

// Create new contact
export const createContact = async (contactData) => {
  try {
    const apperClient = getApperClient();
    const now = new Date().toISOString();
    
    const params = {
      records: [{
        name_c: contactData.name || '',
        email_c: contactData.email || '',
        phone_c: contactData.phone || '',
        company_c: contactData.company || '',
        position_c: contactData.position || '',
        notes_c: contactData.notes || '',
        tags_c: Array.isArray(contactData.tags) ? contactData.tags.join(',') : '',
        created_at_c: now,
        updated_at_c: now
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
        console.error(`Failed to create ${failed.length} contacts:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        const record = successful[0].data;
        return {
          id: record.Id,
          name: record.name_c || '',
          email: record.email_c || '',
          phone: record.phone_c || '',
          company: record.company_c || '',
          position: record.position_c || '',
          notes: record.notes_c || '',
          tags: record.tags_c ? record.tags_c.split(',').map(tag => tag.trim()).filter(Boolean) : [],
          createdAt: record.created_at_c || now,
          updatedAt: record.updated_at_c || now
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error creating contact:", error?.response?.data?.message || error);
    return null;
  }
};

// Update existing contact
export const updateContact = async (id, contactData) => {
  try {
    const apperClient = getApperClient();
    const now = new Date().toISOString();
    
    const params = {
      records: [{
        Id: parseInt(id),
        name_c: contactData.name || '',
        email_c: contactData.email || '',
        phone_c: contactData.phone || '',
        company_c: contactData.company || '',
        position_c: contactData.position || '',
        notes_c: contactData.notes || '',
        tags_c: Array.isArray(contactData.tags) ? contactData.tags.join(',') : '',
        updated_at_c: now
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
        console.error(`Failed to update ${failed.length} contacts:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        const record = successful[0].data;
        return {
          id: record.Id,
          name: record.name_c || '',
          email: record.email_c || '',
          phone: record.phone_c || '',
          company: record.company_c || '',
          position: record.position_c || '',
          notes: record.notes_c || '',
          tags: record.tags_c ? record.tags_c.split(',').map(tag => tag.trim()).filter(Boolean) : [],
          createdAt: record.created_at_c || contactData.createdAt || now,
          updatedAt: record.updated_at_c || now
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error updating contact:", error?.response?.data?.message || error);
    return null;
  }
};

// Delete contact
export const deleteContact = async (id) => {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.deleteRecord(TABLE_NAME, {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return { success: false };
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} contacts:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }

      return { success: successful.length > 0 };
    }
    return { success: false };
  } catch (error) {
    console.error("Error deleting contact:", error?.response?.data?.message || error);
    return { success: false };
  }
};

// Search contacts
export const searchContacts = async (query) => {
  try {
    const apperClient = getApperClient();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return getAllContacts();
    }

    const response = await apperClient.fetchRecords(TABLE_NAME, {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "email_c"}},
        {"field": {"Name": "phone_c"}},
        {"field": {"Name": "company_c"}},
        {"field": {"Name": "position_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "tags_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "updated_at_c"}}
      ],
      whereGroups: [{
        "operator": "OR",
        "subGroups": [
          {
            "conditions": [
              {"fieldName": "name_c", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "email_c", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "company_c", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "position_c", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "notes_c", "operator": "Contains", "values": [searchTerm]},
              {"fieldName": "tags_c", "operator": "Contains", "values": [searchTerm]}
            ],
            "operator": "OR"
          }
        ]
      }],
      orderBy: [{"fieldName": "created_at_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    });

    if (!response.success) {
      console.error(response.message);
      return [];
    }

    // Transform database records to match UI expectations
    return response.data?.map(record => ({
      id: record.Id,
      name: record.name_c || '',
      email: record.email_c || '',
      phone: record.phone_c || '',
      company: record.company_c || '',
      position: record.position_c || '',
      notes: record.notes_c || '',
      tags: record.tags_c ? record.tags_c.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      createdAt: record.created_at_c || new Date().toISOString(),
      updatedAt: record.updated_at_c || new Date().toISOString()
    })) || [];
  } catch (error) {
    console.error("Error searching contacts:", error?.response?.data?.message || error);
    return [];
  }
};