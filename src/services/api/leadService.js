// Mock Lead Service - Replace with ApperClient when leads table becomes available
import { toast } from 'react-toastify';

// Mock data storage
let mockLeads = [
  {
    id: 1,
    name_c: "Sarah Johnson",
    email_c: "sarah.johnson@techcorp.com",
    phone_c: "+1-555-0123",
    company_c: "TechCorp Industries",
    position_c: "CTO",
    status_c: "qualified",
    source_c: "website",
    value_c: 50000,
    notes_c: "Interested in enterprise solution, budget approved for Q2",
    tags_c: "enterprise,technology,hot-lead",
    created_at_c: "2024-01-15T10:30:00Z",
    updated_at_c: "2024-01-20T14:45:00Z"
  },
  {
    id: 2,
    name_c: "Michael Chen",
    email_c: "m.chen@innovateplus.com",
    company_c: "InnovatePlus",
    phone_c: "+1-555-0234",
    position_c: "Head of Operations",
    status_c: "new",
    source_c: "referral",
    value_c: 25000,
    notes_c: "Referred by existing client, needs demo scheduling",
    tags_c: "referral,operations,warm-lead",
    created_at_c: "2024-01-18T09:15:00Z",
    updated_at_c: "2024-01-18T09:15:00Z"
  },
  {
    id: 3,
    name_c: "Emily Rodriguez",
    email_c: "emily.r@marketpro.net",
    company_c: "MarketPro Solutions",
    phone_c: "+1-555-0345",
    position_c: "Marketing Director",
    status_c: "contacted",
    source_c: "linkedin",
    value_c: 35000,
    notes_c: "Actively evaluating solutions, comparing with competitors",
    tags_c: "marketing,evaluation,competitive",
    created_at_c: "2024-01-20T16:20:00Z",
    updated_at_c: "2024-01-22T11:30:00Z"
  }
];

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get all leads with optional filtering
export const getAllLeads = async (filters = {}) => {
  await delay(300);
  
  try {
    let filteredLeads = [...mockLeads];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.name_c?.toLowerCase().includes(searchTerm) ||
        lead.company_c?.toLowerCase().includes(searchTerm) ||
        lead.email_c?.toLowerCase().includes(searchTerm) ||
        lead.tags_c?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.status_c === filters.status);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filteredLeads.sort((a, b) => {
        const aVal = a[filters.sortBy] || '';
        const bVal = b[filters.sortBy] || '';
        
        if (filters.sortOrder === 'desc') {
          return String(bVal).localeCompare(String(aVal));
        }
        return String(aVal).localeCompare(String(bVal));
      });
    }
    
    return filteredLeads;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw new Error('Failed to fetch leads');
  }
};

// Get lead by ID
export const getLeadById = async (id) => {
  await delay(200);
  
  try {
    const lead = mockLeads.find(l => l.id === parseInt(id));
    if (!lead) {
      throw new Error('Lead not found');
    }
    return lead;
  } catch (error) {
    console.error('Error fetching lead:', error);
    throw new Error('Failed to fetch lead');
  }
};

// Create new lead
export const createLead = async (leadData) => {
  await delay(400);
  
  try {
    const newLead = {
      ...leadData,
      id: Math.max(...mockLeads.map(l => l.id), 0) + 1,
      created_at_c: new Date().toISOString(),
      updated_at_c: new Date().toISOString()
    };
    
    mockLeads.push(newLead);
    return newLead;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw new Error('Failed to create lead');
  }
};

// Update existing lead
export const updateLead = async (id, leadData) => {
  await delay(350);
  
  try {
    const leadIndex = mockLeads.findIndex(l => l.id === parseInt(id));
    if (leadIndex === -1) {
      throw new Error('Lead not found');
    }
    
    mockLeads[leadIndex] = {
      ...mockLeads[leadIndex],
      ...leadData,
      updated_at_c: new Date().toISOString()
    };
    
    return mockLeads[leadIndex];
  } catch (error) {
    console.error('Error updating lead:', error);
    throw new Error('Failed to update lead');
  }
};

// Delete lead
export const deleteLead = async (id) => {
  await delay(300);
  
  try {
    const leadIndex = mockLeads.findIndex(l => l.id === parseInt(id));
    if (leadIndex === -1) {
      throw new Error('Lead not found');
    }
    
    mockLeads.splice(leadIndex, 1);
    return { success: true };
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw new Error('Failed to delete lead');
  }
};

// Search leads
export const searchLeads = async (query) => {
  return getAllLeads({ search: query });
};

// Update lead status
export const updateLeadStatus = async (id, status) => {
  return updateLead(id, { status_c: status });
};

// Get lead statistics
export const getLeadStats = async () => {
  await delay(250);
  
  try {
    const total = mockLeads.length;
    const qualified = mockLeads.filter(l => l.status_c === 'qualified').length;
    const contacted = mockLeads.filter(l => l.status_c === 'contacted').length;
    const newLeads = mockLeads.filter(l => l.status_c === 'new').length;
    const totalValue = mockLeads.reduce((sum, lead) => sum + (lead.value_c || 0), 0);
    
    return {
      total,
      new: newLeads,
      contacted,
      qualified,
      totalValue
    };
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    throw new Error('Failed to fetch lead statistics');
  }
};