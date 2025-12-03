import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

// Get all tasks with related lookup data
export async function getAllTasks() {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('tasks_c', {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "due_date_c"}},
        {"field": {"Name": "deal_c"}},
        {"field": {"Name": "contact_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "priority_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching tasks:", error?.response?.data?.message || error);
    toast.error("Failed to load tasks");
    return [];
  }
}

// Get task by ID
export async function getTaskById(taskId) {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.getRecordById('tasks_c', taskId, {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "due_date_c"}},
        {"field": {"Name": "deal_c"}},
        {"field": {"Name": "contact_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "priority_c"}},
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
    console.error(`Error fetching task ${taskId}:`, error?.response?.data?.message || error);
    toast.error("Failed to load task");
    return null;
  }
}

// Create new task
export async function createTask(taskData) {
  try {
    const apperClient = getApperClient();
    
    // Only include updateable fields
    const payload = {
      records: [{
        Name: taskData.Name,
        description_c: taskData.description_c,
        due_date_c: taskData.due_date_c,
        deal_c: taskData.deal_c ? parseInt(taskData.deal_c) : undefined,
        contact_c: taskData.contact_c ? parseInt(taskData.contact_c) : undefined,
        status_c: taskData.status_c ? parseInt(taskData.status_c) : undefined,
        priority_c: taskData.priority_c ? parseInt(taskData.priority_c) : undefined
      }]
    };

    // Remove undefined fields
    Object.keys(payload.records[0]).forEach(key => {
      if (payload.records[0][key] === undefined) {
        delete payload.records[0][key];
      }
    });

    const response = await apperClient.createRecord('tasks_c', payload);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} tasks:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success("Task created successfully");
        return successful[0].data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error creating task:", error?.response?.data?.message || error);
    toast.error("Failed to create task");
    return null;
  }
}

// Update existing task
export async function updateTask(taskId, taskData) {
  try {
    const apperClient = getApperClient();
    
    // Only include updateable fields
    const payload = {
      records: [{
        Id: taskId,
        Name: taskData.Name,
        description_c: taskData.description_c,
        due_date_c: taskData.due_date_c,
        deal_c: taskData.deal_c ? parseInt(taskData.deal_c) : undefined,
        contact_c: taskData.contact_c ? parseInt(taskData.contact_c) : undefined,
        status_c: taskData.status_c ? parseInt(taskData.status_c) : undefined,
        priority_c: taskData.priority_c ? parseInt(taskData.priority_c) : undefined
      }]
    };

    // Remove undefined fields
    Object.keys(payload.records[0]).forEach(key => {
      if (payload.records[0][key] === undefined && key !== 'Id') {
        delete payload.records[0][key];
      }
    });

    const response = await apperClient.updateRecord('tasks_c', payload);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} tasks:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success("Task updated successfully");
        return successful[0].data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error updating task:", error?.response?.data?.message || error);
    toast.error("Failed to update task");
    return null;
  }
}

// Delete task
export async function deleteTask(taskId) {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.deleteRecord('tasks_c', {
      RecordIds: [taskId]
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
        console.error(`Failed to delete ${failed.length} tasks:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success("Task deleted successfully");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error deleting task:", error?.response?.data?.message || error);
    toast.error("Failed to delete task");
    return false;
  }
}

// Get all task statuses
export async function getAllTaskStatuses() {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('task_status_c', {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "name_c"}}
      ],
      orderBy: [{"fieldName": "name_c", "sorttype": "ASC"}]
    });

    if (!response.success) {
      console.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching task statuses:", error?.response?.data?.message || error);
    return [];
  }
}

// Get all task priorities
export async function getAllTaskPriorities() {
  try {
    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('task_priority_c', {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "name_c"}}
      ],
      orderBy: [{"fieldName": "name_c", "sorttype": "ASC"}]
    });

    if (!response.success) {
      console.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching task priorities:", error?.response?.data?.message || error);
    return [];
  }
}

// Search tasks
export async function searchTasks(searchTerm) {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return getAllTasks();
    }

    const apperClient = getApperClient();
    const response = await apperClient.fetchRecords('tasks_c', {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "due_date_c"}},
        {"field": {"Name": "deal_c"}},
        {"field": {"Name": "contact_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "priority_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      where: [
        {
          "FieldName": "Name",
          "Operator": "Contains",
          "Values": [searchTerm.trim()],
          "Include": true
        }
      ],
      orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    });

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error searching tasks:", error?.response?.data?.message || error);
    toast.error("Failed to search tasks");
    return [];
  }
}