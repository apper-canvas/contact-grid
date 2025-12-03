import { getApperClient } from "@/services/apperClient";
export const taskService = {
  async getAll() {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "created_date_c"}},
          {"field": {"Name": "completed_date_c"}}
        ],
        orderBy: [{"fieldName": "created_date_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('tasks_c', parseInt(id), {
        fields: [
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "created_date_c"}},
          {"field": {"Name": "completed_date_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(taskData) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          title_c: taskData.title_c || taskData.title,
          description_c: taskData.description_c || taskData.description,
          due_date_c: taskData.due_date_c || taskData.dueDate,
          status_c: parseInt(taskData.status_c || taskData.status),
          priority_c: parseInt(taskData.priority_c || taskData.priority),
          contact_c: taskData.contact_c ? parseInt(taskData.contact_c) : null,
          company_c: taskData.company_c ? parseInt(taskData.company_c) : null,
          assigned_to_c: taskData.assigned_to_c || taskData.assignedTo
        }]
      };

      const response = await apperClient.createRecord('tasks_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, taskData) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          title_c: taskData.title_c || taskData.title,
          description_c: taskData.description_c || taskData.description,
          due_date_c: taskData.due_date_c || taskData.dueDate,
          status_c: parseInt(taskData.status_c || taskData.status),
          priority_c: parseInt(taskData.priority_c || taskData.priority),
          contact_c: taskData.contact_c ? parseInt(taskData.contact_c) : null,
          company_c: taskData.company_c ? parseInt(taskData.company_c) : null,
          assigned_to_c: taskData.assigned_to_c || taskData.assignedTo,
          completed_date_c: taskData.completed_date_c || (taskData.status_c === '3' ? new Date().toISOString() : null)
        }]
      };

      const response = await apperClient.updateRecord('tasks_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord('tasks_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete task: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message);
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      throw error;
    }
  }
};