import React, { useState, useEffect } from 'react';
import { getAllContacts } from '@/services/api/contactService';
import Button from '@/components/atoms/Button';
import ContactCard from '@/components/molecules/ContactCard';
import Loading from '@/components/ui/Loading';
import ApperIcon from '@/components/ApperIcon';

export default function AssociatedContacts({ companyName }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContacts();
  }, [companyName]);

  const loadContacts = async () => {
    if (!companyName) {
      setContacts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allContacts = await getAllContacts();
      // Filter contacts by company name
      const companyContacts = allContacts.filter(contact => 
        contact.company_c?.toLowerCase() === companyName.toLowerCase()
      );
      setContacts(companyContacts);
    } catch (err) {
      setError('Failed to load contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Contacts</h3>
        <Loading />
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Associated Contacts ({contacts.length})
        </h3>
        <Button 
          size="sm" 
          className="flex items-center space-x-2"
          onClick={() => {
            // Navigate to contact management with company pre-filled
            window.location.href = `/contacts?company=${encodeURIComponent(companyName)}`;
          }}
        >
          <ApperIcon name="Plus" size={14} />
          <span>Add Contact</span>
        </Button>
      </div>

      {error && (
        <div className="text-center py-8">
          <ApperIcon name="AlertCircle" size={48} className="text-red-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Contacts</h4>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadContacts} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {!error && contacts.length === 0 && (
        <div className="text-center py-8">
          <ApperIcon name="Users" size={48} className="text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Contacts Found</h4>
          <p className="text-gray-500 mb-4">
            No contacts are associated with this company yet.
          </p>
          <Button 
            onClick={() => {
              window.location.href = `/contacts?company=${encodeURIComponent(companyName)}`;
            }}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={16} />
            <span>Add First Contact</span>
          </Button>
        </div>
      )}

      {!error && contacts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.Id}
              contact={contact}
              isSelected={false}
              onClick={() => {
                // Navigate to contact detail
                window.location.href = `/contacts/${contact.Id}`;
              }}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}