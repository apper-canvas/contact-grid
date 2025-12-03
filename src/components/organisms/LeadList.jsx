import React, { useEffect, useState } from 'react';
import { getAllLeads, searchLeads } from '@/services/api/leadService';
import ApperIcon from '@/components/ApperIcon';
import Tag from '@/components/atoms/Tag';
import Button from '@/components/atoms/Button';
import SortFilter from '@/components/molecules/SortFilter';
import SearchBar from '@/components/molecules/SearchBar';
import Empty from '@/components/ui/Empty';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';

function LeadList({ 
  selectedLead, 
  onLeadSelect, 
  onAddLead, 
  onEditLead, 
  onDeleteLead,
  onBulkUpdate,
  onBulkDelete,
  refreshTrigger 
}) {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedLeads, setSelectedLeads] = useState(new Set());

  const statusOptions = ['All', 'New', 'Contacted', 'Qualified', 'Lost', 'Converted'];
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadLeads();
  }, [refreshTrigger]);

  useEffect(() => {
    performSearch();
  }, [searchQuery, leads]);

  useEffect(() => {
    filterAndSort();
  }, [leads, sortBy, statusFilter]);

  async function loadLeads() {
    try {
      setLoading(true);
      setError(null);
      const leadsData = await getAllLeads();
      setLeads(leadsData || []);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  async function performSearch() {
    if (!searchQuery.trim()) {
      setFilteredLeads(leads);
      return;
    }

    try {
      const results = await searchLeads(searchQuery);
      setFilteredLeads(results || []);
    } catch (err) {
      console.error("Error searching leads:", err);
      setFilteredLeads([]);
    }
  }

  function filterAndSort() {
    let filtered = searchQuery ? filteredLeads : leads;
    
    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'company':
          return (a.company || '').localeCompare(b.company || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'value':
          return (b.value || 0) - (a.value || 0);
        case 'created':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredLeads(sorted);
  }

  function handleLeadSelection(leadId, checked) {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  }

  function handleSelectAll(checked) {
    if (checked) {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
  }

  function clearSelection() {
    setSelectedLeads(new Set());
  }

  function getStatusColor(status) {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Lost': 'bg-red-100 text-red-800',
      'Converted': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function formatCurrency(value) {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (loading) return <Loading />;
  if (error) return <ErrorView title="Error Loading Leads" message={error} onRetry={loadLeads} />;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-shrink-0 p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
          <Button onClick={onAddLead} className="bg-blue-600 hover:bg-blue-700">
            <ApperIcon name="Plus" size={16} />
            Add Lead
          </Button>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search leads by name, email, or company..."
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <SortFilter
            sortBy={sortBy}
            onSortChange={setSortBy}
            className="flex-shrink-0"
          />
        </div>

        {selectedLeads.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              {selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkUpdate(Array.from(selectedLeads), clearSelection)}
              >
                <ApperIcon name="Edit" size={14} />
                Bulk Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkDelete(Array.from(selectedLeads), clearSelection)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <ApperIcon name="Trash2" size={14} />
                Delete Selected
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {filteredLeads.length === 0 ? (
          <Empty
            title="No leads found"
            message={searchQuery ? "Try adjusting your search criteria" : "Get started by adding your first lead"}
            actionLabel="Add Lead"
            onAction={onAddLead}
          />
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Select all</span>
              </div>

              {filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer contact-card-hover"
                  onClick={() => onLeadSelect(lead)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleLeadSelection(lead.id, e.target.checked);
                      }}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 truncate">
                            {lead.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {lead.position} at {lead.company}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(lead.value)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Mail" size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <ApperIcon name="Phone" size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{lead.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <ApperIcon name="MapPin" size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{lead.source}</span>
                        </div>
                      </div>

                      {lead.tags && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {lead.tags.split(',').map((tag, index) => (
                            <Tag key={index} label={tag.trim()} size="sm" />
                          ))}
                        </div>
                      )}

                      {lead.notes && (
                        <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                          {lead.notes}
                        </p>
                      )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditLead(lead);
                        }}
                      >
                        <ApperIcon name="Edit2" size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLead(lead);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <ApperIcon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadList;