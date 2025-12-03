import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Tag from "@/components/atoms/Tag";
import Button from "@/components/atoms/Button";
import { format } from "date-fns";

const ContactDetail = ({ contact, onEdit, onDelete }) => {
  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <ApperIcon name="Users" size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Select a contact to view details</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

return (
    <div className="bg-surface rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
<div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div>
<h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
{contact.Name || contact.name_c || 'No Name'}
            </h2>
            <p className="text-base lg:text-lg text-secondary">
              {contact.position_c || 'No Position'} at {contact.company_c || 'No Company'}
            </p>
            {contact.contact_person_name_c && (
              <p className="text-sm text-gray-600">
                Contact Person: {contact.contact_person_name_c}
              </p>
            )}
          </div>
<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
            <Button
              variant="secondary"
size="sm"
              icon="Edit"
              onClick={() => onEdit(contact)}
              className="min-h-[44px] justify-center"
            >
              Edit
            </Button>
            <Button
              variant="danger"
size="sm"
              icon="Trash2"
              onClick={() => onDelete(contact)}
              className="min-h-[44px] justify-center"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Information */}
<div className="p-4 lg:p-6 space-y-6">
        {/* Basic Info */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
{contact.first_name_c && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                First Name
              </h3>
              <div className="flex items-center space-x-2">
                <ApperIcon name="User" size={16} className="text-gray-400" />
                <span className="text-gray-900">{contact.first_name_c}</span>
              </div>
            </div>
          )}

          {contact.last_name_c && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Last Name
              </h3>
              <div className="flex items-center space-x-2">
                <ApperIcon name="User" size={16} className="text-gray-400" />
                <span className="text-gray-900">{contact.last_name_c}</span>
              </div>
            </div>
          )}

{contact.contact_person_name_c && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Contact Person Name
              </h3>
              <div className="flex items-center space-x-2">
                <ApperIcon name="UserCheck" size={16} className="text-gray-400" />
                <span className="text-gray-900">{contact.contact_person_name_c}</span>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Email Address
            </h3>
            <div className="flex items-center space-x-2">
              <ApperIcon name="Mail" size={16} className="text-gray-400" />
              <a 
href={`mailto:${contact.email_c || ''}`}
                className="text-primary hover:text-accent transition-colors"
              >
                {contact.email_c || 'No Email'}
              </a>
            </div>
          </div>

{contact.phone_c && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Phone Number
              </h3>
              <div className="flex items-center space-x-2">
                <ApperIcon name="Phone" size={16} className="text-gray-400" />
<a 
                  href={`tel:${contact.phone_c || ''}`}
                  className="text-primary hover:text-accent transition-colors"
                >
                  {contact.phone_c}
                </a>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Company
            </h3>
<div className="flex items-center space-x-2">
              <ApperIcon name="Building" size={16} className="text-gray-400" />
              <span className="text-gray-900">{contact.company_c || 'No Company'}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Position
            </h3>
<div className="flex items-center space-x-2">
              <ApperIcon name="Briefcase" size={16} className="text-gray-400" />
              <span className="text-gray-900">{contact.position_c || 'No Position'}</span>
            </div>
          </div>

{contact.address_c && (
            <div className="lg:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Address
              </h3>
              <div className="flex items-start space-x-2">
                <ApperIcon name="MapPin" size={16} className="text-gray-400 mt-0.5" />
                <span className="text-gray-900 whitespace-pre-line">{contact.address_c}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
{contact.Tags && contact.Tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              {contact.Tags.split(',').map((tag, index) => (
                <Tag key={index} label={tag.trim()} />
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {contact.notes_c && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Notes</h3>
<div className="bg-gray-50 rounded-lg p-3 lg:p-4">
              <p className="text-sm lg:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {contact.notes_c}
              </p>
            </div>
          </div>
        )}
        {/* Metadata */}
<div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span> {formatDate(contact.CreatedOn || contact.created_at_c)}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {formatDate(contact.ModifiedOn || contact.updated_at_c)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;