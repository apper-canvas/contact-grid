import React from 'react';
import ApperIcon from '@/components/ApperIcon';

export default function CompanyInfo({ company }) {
  const InfoSection = ({ icon, title, children }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <ApperIcon name={icon} size={18} className="text-primary" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="bg-surface rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoSection icon="Building2" title="Industry">
          <p className="text-gray-700">
            {company.industry_c || 'Not specified'}
          </p>
        </InfoSection>

        <InfoSection icon="Users" title="Company Size">
          <p className="text-gray-700">
            {company.size_c 
              ? `${company.size_c.toLocaleString()} employees`
              : 'Not specified'
            }
          </p>
        </InfoSection>

        <InfoSection icon="DollarSign" title="Annual Revenue">
          <p className="text-gray-700">
            {company.revenue_c 
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(company.revenue_c)
              : 'Not specified'
            }
          </p>
        </InfoSection>

        <InfoSection icon="Phone" title="Contact Details">
          <div className="text-gray-700 whitespace-pre-wrap">
            {company.contact_details_c || 'No contact details provided'}
          </div>
        </InfoSection>
      </div>

      {company.Tags && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <ApperIcon name="Tag" size={18} className="text-primary" />
            <h4 className="font-medium text-gray-900">Tags</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.Tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}