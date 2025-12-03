import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import QuoteTable from "@/components/molecules/QuoteTable";
import QuoteCard from "@/components/molecules/QuoteCard";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { getAllQuotes, getQuotesByStatus, searchQuotes } from "@/services/api/quoteService";

const QuoteList = ({ 
  onEdit, 
  onDelete, 
  onView, 
  refreshTrigger = 0 
}) => {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("updated_at_c");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewMode, setViewMode] = useState("table"); // table or cards

  const statusOptions = [
    { value: "All", label: "All Quotes", count: 0 },
    { value: "Draft", label: "Draft", count: 0 },
    { value: "Sent", label: "Sent", count: 0 },
    { value: "Accepted", label: "Accepted", count: 0 },
    { value: "Rejected", label: "Rejected", count: 0 }
  ];

  useEffect(() => {
    loadQuotes();
  }, [refreshTrigger]);

  useEffect(() => {
    filterAndSortQuotes();
  }, [quotes, searchTerm, statusFilter, sortField, sortDirection]);

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAllQuotes();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading quotes:", err);
      setError("Failed to load quotes");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortQuotes = () => {
    let filtered = [...quotes];

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(quote => quote.status_c === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quote =>
        quote.Name?.toLowerCase().includes(term) ||
        quote.customer_name_c?.toLowerCase().includes(term) ||
        quote.customer_email_c?.toLowerCase().includes(term) ||
        quote.description_c?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (sortField === "amount_c") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortField.includes("date") || sortField.includes("_at_")) {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredQuotes(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusCounts = () => {
    const counts = quotes.reduce((acc, quote) => {
      acc[quote.status_c] = (acc[quote.status_c] || 0) + 1;
      return acc;
    }, {});

    return statusOptions.map(option => ({
      ...option,
      count: option.value === "All" ? quotes.length : (counts[option.value] || 0)
    }));
  };

  const getTotalValue = () => {
    return filteredQuotes.reduce((sum, quote) => sum + (quote.amount_c || 0), 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadQuotes} />;

  if (quotes.length === 0) {
    return (
      <Empty
        icon="FileText"
        title="No quotes yet"
        description="Create your first quote to start managing customer proposals."
      />
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Stats and Status Filter */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusCounts.map((status) => (
          <button
            key={status.value}
            onClick={() => handleStatusFilter(status.value)}
            className={`p-4 rounded-lg border transition-colors ${
              statusFilter === status.value
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            }`}
          >
            <div className="text-2xl font-bold">{status.count}</div>
            <div className="text-sm">{status.label}</div>
          </button>
        ))}
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Total Value Display */}
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <span className="font-medium">Total: {formatCurrency(getTotalValue())}</span>
          </div>

          {/* Sort Dropdown */}
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortField(field);
              setSortDirection(direction);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          >
            <option value="updated_at_c-desc">Latest Updated</option>
            <option value="created_at_c-desc">Latest Created</option>
            <option value="Name-asc">Name A-Z</option>
            <option value="Name-desc">Name Z-A</option>
            <option value="amount_c-desc">Amount High-Low</option>
            <option value="amount_c-asc">Amount Low-High</option>
            <option value="valid_until_c-asc">Valid Until (Soon First)</option>
            <option value="valid_until_c-desc">Valid Until (Far First)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
                viewMode === "table"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ApperIcon name="List" size={16} />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-2 text-sm rounded-r-lg border-l border-gray-300 transition-colors ${
                viewMode === "cards"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ApperIcon name="Grid3X3" size={16} />
            </button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadQuotes}
          >
            <ApperIcon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredQuotes.length} of {quotes.length} quotes
        {searchTerm && ` matching "${searchTerm}"`}
        {statusFilter !== "All" && ` with status "${statusFilter}"`}
      </div>

      {/* Quotes Display */}
      {filteredQuotes.length === 0 ? (
        <Empty
          icon="Search"
          title="No quotes found"
          description={
            searchTerm || statusFilter !== "All"
              ? "Try adjusting your search or filter criteria."
              : "No quotes match the current criteria."
          }
        />
      ) : viewMode === "table" ? (
        <QuoteTable
          quotes={filteredQuotes}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.Id}
              quote={quote}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteList;