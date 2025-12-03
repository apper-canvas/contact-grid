import quotesData from '../mockData/quotes.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllQuotes = async () => {
  await delay(300);
  return [...quotesData];
};

export const getQuoteById = async (id) => {
  await delay(200);
  const quote = quotesData.find(q => q.Id === parseInt(id));
  return quote ? { ...quote } : null;
};

export const createQuote = async (quoteData) => {
  await delay(400);
  
  const newQuote = {
    ...quoteData,
    Id: Date.now(),
    created_at_c: new Date().toISOString(),
    updated_at_c: new Date().toISOString()
  };
  
  quotesData.push(newQuote);
  return { ...newQuote };
};

export const updateQuote = async (id, updateData) => {
  await delay(350);
  
  const index = quotesData.findIndex(q => q.Id === parseInt(id));
  if (index === -1) {
    throw new Error('Quote not found');
  }
  
  const updatedQuote = {
    ...quotesData[index],
    ...updateData,
    updated_at_c: new Date().toISOString()
  };
  
  quotesData[index] = updatedQuote;
  return { ...updatedQuote };
};

export const deleteQuote = async (id) => {
  await delay(250);
  
  const index = quotesData.findIndex(q => q.Id === parseInt(id));
  if (index === -1) {
    return false;
  }
  
  quotesData.splice(index, 1);
  return true;
};

export const getQuotesByStatus = async (status) => {
  await delay(300);
  return quotesData.filter(quote => quote.status_c === status);
};

export const searchQuotes = async (searchTerm) => {
  await delay(250);
  if (!searchTerm) return [...quotesData];
  
  const term = searchTerm.toLowerCase();
  return quotesData.filter(quote => 
    quote.Name?.toLowerCase().includes(term) ||
    quote.customer_name_c?.toLowerCase().includes(term) ||
    quote.customer_email_c?.toLowerCase().includes(term) ||
    quote.description_c?.toLowerCase().includes(term)
  );
};