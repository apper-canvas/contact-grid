import React, { useEffect, useState } from 'react';
import { getAllLeads, getLeadStats } from '@/services/api/leadService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import SortFilter from '@/components/molecules/SortFilter';
import LeadCard from '@/components/molecules/LeadCard';
import LeadTable from '@/components/molecules/LeadTable';
import Empty from '@/components/ui/Empty';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';

function LeadList({ onAddLead, onEditLead, onDeleteLead, refreshTrigger }) {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at_c');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [stats, setStats] = useState(null);

  // Load leads and stats
  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [leadsData, statsData] = await Promise.all([
        getAllLeads({ sortBy, sortOrder, status: statusFilter }),
        getLeadStats()
      ]);
      
      setLeads(leadsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading leads:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredLeads(leads);
      return;
    }

    try {
      const results = leads.filter(lead =>
        lead.name_c?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company_c?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email_c?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.tags_c?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLeads(results);
    } catch (error) {
      console.error('Search error:', error);
      setFilteredLeads(leads);
    }
  };

  // Sort and filter leads
  const applySorting = () => {
    const sorted = [...(searchQuery ? filteredLeads : leads)].sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      
      if (sortOrder === 'desc') {
        return String(bVal).localeCompare(String(aVal));
      }
      return String(aVal).localeCompare(String(bVal));
    });
    
    if (searchQuery) {
      setFilteredLeads(sorted);
    } else {
      setLeads(sorted);
    }
  };

  // Lead selection handlers
  const handleLeadSelection = (leadId, checked) => {
    setSelectedLeads(prev =>
      checked
        ? [...prev, leadId]
        : prev.filter(id => id !== leadId)
    );
  };

  const handleSelectAll = (checked) => {
    const currentLeads = searchQuery ? filteredLeads : leads;
    setSelectedLeads(checked ? currentLeads.map(lead => lead.id) : []);
  };

  const clearSelection = () => {
    setSelectedLeads([]);
  };

  // Effects
  useEffect(() => {
    loadLeads();
  }, [sortBy, sortOrder, statusFilter, refreshTrigger]);

  useEffect(() => {
    performSearch();
  }, [searchQuery, leads]);

  useEffect(() => {
    applySorting();
  }, [sortBy, sortOrder]);

  // Render loading state
  if (loading && leads.length === 0) {
    return <Loading />;
  }

  // Render error state
  if (error) {
    return (
      <ErrorView
        title="Failed to load leads"
        message={error}
        onRetry={loadLeads}
      />
    );
  }

  const currentLeads = searchQuery ? filteredLeads : leads;
  const hasSelection = selectedLeads.length > 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ApperIcon name="Users" size={20} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ApperIcon name="UserPlus" size={20} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ApperIcon name="Phone" size={20} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.contacted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ApperIcon name="CheckCircle" size={20} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.qualified}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ApperIcon name="DollarSign" size={20} className="text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalValue?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600">Manage and track your sales leads</p>
        </div>
        <Button onClick={onAddLead} className="self-start">
          <ApperIcon name="Plus" size={18} />
          Add Lead
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search leads by name, company, email..."
            />
          </div>
          
          <SortFilter
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={setSortBy}
            onOrderChange={setSortOrder}
            options={[
              { value: 'name_c', label: 'Name' },
              { value: 'company_c', label: 'Company' },
              { value: 'status_c', label: 'Status' },
              { value: 'value_c', label: 'Value' },
              { value: 'created_at_c', label: 'Created Date' }
            ]}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-lg ${
              viewMode === 'cards'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ApperIcon name="Grid3X3" size={18} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg ${
              viewMode === 'table'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ApperIcon name="List" size={18} />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {hasSelection && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  // Handle bulk actions
                  console.log('Bulk action for leads:', selectedLeads);
                }}
              >
                Bulk Action
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {currentLeads.length === 0 ? (
        <Empty
          title="No leads found"
          message={
            searchQuery
              ? "No leads match your search criteria. Try adjusting your search terms."
              : "Get started by creating your first lead."
          }
          actionLabel={!searchQuery ? "Add Lead" : undefined}
          onAction={!searchQuery ? onAddLead : undefined}
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentLeads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              isSelected={selectedLeads.includes(lead.id)}
              onSelect={(checked) => handleLeadSelection(lead.id, checked)}
              onEdit={() => onEditLead(lead)}
              onDelete={() => onDeleteLead(lead)}
            />
          ))}
        </div>
      ) : (
        <LeadTable
          leads={currentLeads}
          selectedLeads={selectedLeads}
          onSelectAll={handleSelectAll}
          onSelectLead={handleLeadSelection}
          onEdit={onEditLead}
          onDelete={onDeleteLead}
        />
      )}
    </div>
  );
}

export default LeadList;