import leadsData from '../mockData/leads.json';

let leads = [...leadsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllLeads = async () => {
  await delay(300);
  return [...leads];
};

export const getLeadById = async (id) => {
  await delay(200);
  const lead = leads.find(lead => lead.id === parseInt(id));
  return lead ? { ...lead } : null;
};

export const createLead = async (leadData) => {
  await delay(400);
  const newLead = {
    id: Date.now(),
    ...leadData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  leads.push(newLead);
  return { ...newLead };
};

export const updateLead = async (id, leadData) => {
  await delay(350);
  const index = leads.findIndex(lead => lead.id === parseInt(id));
  
  if (index === -1) {
    throw new Error('Lead not found');
  }
  
  leads[index] = {
    ...leads[index],
    ...leadData,
    id: parseInt(id),
    updatedAt: new Date().toISOString()
  };
  
  return { ...leads[index] };
};

export const deleteLead = async (id) => {
  await delay(300);
  const index = leads.findIndex(lead => lead.id === parseInt(id));
  
  if (index === -1) {
    throw new Error('Lead not found');
  }
  
  leads.splice(index, 1);
  return true;
};

export const searchLeads = async (query) => {
  await delay(250);
  if (!query || query.trim() === '') {
    return [...leads];
  }
  
  const searchTerm = query.toLowerCase().trim();
  return leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm) ||
    lead.email?.toLowerCase().includes(searchTerm) ||
    lead.company?.toLowerCase().includes(searchTerm) ||
    lead.source?.toLowerCase().includes(searchTerm)
  );
};