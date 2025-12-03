import React, { useEffect, useState } from "react";
import { getAllContacts, searchContacts } from "@/services/api/contactService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Tag from "@/components/atoms/Tag";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import SortFilter from "@/components/molecules/SortFilter";

const ContactList = ({ 
  selectedContact, 
  onContactSelect, 
  onAddContact,
  refreshTrigger,
  onEdit,
  onBulkDelete
}) => {
const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [selectedContactIds, setSelectedContactIds] = useState([]);

// Fetch contacts from service
  const loadContacts = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await getAllContacts();
      if (data && Array.isArray(data)) {
        setContacts(data);
        setFilteredContacts(data);
      } else {
        setContacts([]);
        setFilteredContacts([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [refreshTrigger]);

// Handle search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setFilteredContacts(contacts);
        return;
      }

      try {
        const results = await searchContacts(searchQuery);
        if (results && Array.isArray(results)) {
          setFilteredContacts(results);
        } else {
          setFilteredContacts([]);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setFilteredContacts([]);
      }
    };

performSearch();
  }, [searchQuery, contacts]);

// Handle sorting
  useEffect(() => {
    if (filteredContacts && filteredContacts.length > 0) {
      const sortedContacts = [...filteredContacts].sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a.Name || a.name_c || '').localeCompare(b.Name || b.name_c || '');
          case "company":
            return (a.company_c || '').localeCompare(b.company_c || '');
          case "created":
            return new Date(b.CreatedOn || b.created_at_c || 0) - new Date(a.CreatedOn || a.created_at_c || 0);
          case "updated":
          default:
            return new Date(b.ModifiedOn || b.updated_at_c || 0) - new Date(a.ModifiedOn || a.updated_at_c || 0);
        }
      });
      setFilteredContacts(sortedContacts);
    }
  }, [filteredContacts, sortBy]);
// Handle individual checkbox selection
  const handleContactSelection = (contactId, checked) => {
    if (checked) {
      setSelectedContactIds(prev => [...prev, contactId]);
    } else {
      setSelectedContactIds(prev => prev.filter(id => id !== contactId));
    }
  };

  // Handle "select all" checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      const allContactIds = filteredContacts.map(contact => contact.id);
      setSelectedContactIds(allContactIds);
    } else {
      setSelectedContactIds([]);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedContactIds([]);
  };

  // Determine if all contacts are selected
  const allSelected = filteredContacts.length > 0 && selectedContactIds.length === filteredContacts.length;
  const someSelected = selectedContactIds.length > 0 && selectedContactIds.length < filteredContacts.length;

// Handle search input change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadContacts} />;
  }
  return (
    <div className="w-full h-full space-y-4">
    {/* Header with Sort */}
    <div className="flex flex-col gap-4 px-4 lg:px-6 py-4">
        <div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-xl font-bold text-gray-900">All Contacts</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {filteredContacts.length}contact{filteredContacts.length !== 1 ? "s" : ""}total
                                  {selectedContactIds.length > 0 && <span className="ml-2 text-primary font-medium">• {selectedContactIds.length}selected
                                        </span>}
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <SearchBar
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search contacts..."
                    className="w-full sm:w-64" />
                <SortFilter sortBy={sortBy} onSortChange={setSortBy} />
            </div>
        </div>
        {/* Bulk Actions */}
        {selectedContactIds.length > 0 && <div
            className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
                <ApperIcon name="CheckCircle" size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                    {selectedContactIds.length}contact{selectedContactIds.length !== 1 ? "s" : ""}selected
                                  </span>
            </div>
            <div className="flex items-center gap-2">
                {selectedContactIds.length === 1 && <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const contactToEdit = filteredContacts.find(c => c.id === selectedContactIds[0]);

                        if (contactToEdit && onEdit) {
                            onEdit(contactToEdit);
                        }
                    }}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100">
                    <ApperIcon name="Edit" size={14} className="mr-1" />Update
                                    </Button>}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        if (onBulkDelete) {
                            onBulkDelete(selectedContactIds, clearSelection);
                        }
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-100">
                    <ApperIcon name="Trash2" size={14} className="mr-1" />Delete ({selectedContactIds.length})
                                  </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="text-gray-600 hover:text-gray-800">Clear
                </Button>
            </div>
        </div>}
    </div>
    {/* Contact Table */}
    <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px] lg:h-[calc(100vh-200px)]">
        {filteredContacts.length === 0 ? <Empty
            title={searchQuery ? "No contacts found" : "No contacts yet"}
            message={searchQuery ? `No contacts match "${searchQuery}". Try adjusting your search terms.` : "Get started by adding your first contact to begin organizing your professional network."}
            actionLabel="Add Your First Contact"
            onAction={searchQuery ? undefined : onAddContact} /> : <div className="overflow-x-auto overflow-y-auto h-full">
            <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                        <th className="text-left py-3 px-4 w-12">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                ref={el => {
                                    if (el)
                                        el.indeterminate = someSelected;
                                }}
                                onChange={e => handleSelectAll(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                        </th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[200px]">Name</th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[130px]">First Name</th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[130px]">Last Name</th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[160px]">Contact Person</th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[150px]">Company</th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[200px]">Email</th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[150px]">Phone</th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[140px]">Position</th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[180px]">Address</th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[200px]">Notes</th>
                        <th
                            className="text-left py-3 px-4 text-sm font-semibold text-gray-900 min-w-[160px]">Tags</th>
                        <th
                            className="text-right py-3 px-4 text-sm font-semibold text-gray-900 min-w-[100px]">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredContacts.map(contact => <tr
                        key={contact.id}
                        className={`transition-colors hover:bg-gray-50 ${selectedContact?.id === contact.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}`}>
                        <td className="py-3 px-4 w-12">
                            <input
                                type="checkbox"
                                checked={selectedContactIds.includes(contact.id)}
                                onChange={e => {
                                    e.stopPropagation();
                                    handleContactSelection(contact.id, e.target.checked);
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                        </td>
                        <td
                            className="py-3 px-4 min-w-[200px] cursor-pointer"
                            onClick={() => onContactSelect(contact)}>
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <ApperIcon name="User" size={16} className="text-blue-600" />
                                </div>
<div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">{contact.Name || contact.name_c || "No Name"}</p>
                                    <p className="text-xs text-gray-500 truncate">{contact.position_c || "No position"}</p>
                                </div>
                            </div>
                        </td>
                        <td className="py-3 px-4 min-w-[130px]">
                            <p className="text-sm text-gray-900 truncate">{contact.first_name_c || "-"}</p>
                        </td>
                        <td className="py-3 px-4 min-w-[130px]">
                            <p className="text-sm text-gray-900 truncate">{contact.last_name_c || "-"}</p>
                        </td>
                        <td className="py-3 px-4 min-w-[160px]">
                            <p className="text-sm text-gray-900 truncate">{contact.contact_person_name_c || "-"}</p>
                        </td>
                        <td className="py-3 px-4 min-w-[150px]">
                            <p className="text-sm text-gray-900 truncate">{contact.company_c || "-"}</p>
</td>
                        <td className="py-3 px-4 min-w-[200px]">
                            <p className="text-sm text-gray-900 truncate">{contact.email_c || "-"}</p>
                        </td>
                        <td className="py-3 px-4 min-w-[150px]">
                            <p className="text-sm text-gray-900 truncate">{contact.phone_c || "-"}</p>
                        </td>
                        <td className="py-3 px-4 min-w-[140px]">
                            <p className="text-sm text-gray-900 truncate">{contact.position_c || "-"}</p>
                        </td>
                        <td className="py-3 px-4 min-w-[180px]">
                            <p className="text-sm text-gray-900 truncate" title={contact.address_c || ""}>
                                {contact.address_c ? contact.address_c.length > 40 ? `${contact.address_c.substring(0, 40)}...` : contact.address_c : "-"}
                            </p>
                        </td>
                        <td className="py-3 px-4 min-w-[200px]">
                            <p className="text-sm text-gray-900 truncate" title={contact.notes_c || ""}>
                                {contact.notes_c ? contact.notes_c.length > 50 ? `${contact.notes_c.substring(0, 50)}...` : contact.notes_c : "-"}
                            </p>
                        </td>
                        <td className="py-3 px-4 min-w-[160px]">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {contact.Tags && contact.Tags.length > 0 ? contact.Tags.split(',').slice(0, 3).map((tag, index) => <Tag key={index} text={tag.trim()} size="xs" />) : <span className="text-sm text-gray-400">-</span>}
                                {contact.Tags && contact.Tags.split(',').length > 3 && <span className="text-xs text-gray-500 ml-1">+{contact.Tags.split(',').length - 3}</span>}
</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-1">
                                <button
                                    onClick={() => onEdit(contact)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Edit contact">
                                    <ApperIcon name="Edit2" size={16} />
                                </button>
                                <button
                                    onClick={() => onContactSelect(contact)}
                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                    title="View contact">
                                    <ApperIcon name="Eye" size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </div>}
    </div>
</div>
  );
};
ContactList.defaultProps = {
  onEdit: null,
  onBulkDelete: null
};

export default ContactList;