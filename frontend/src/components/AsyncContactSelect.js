import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { masterDataAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Search, Plus, User, Building2, Mail, Phone, FileText } from 'lucide-react';

const AsyncContactSelect = ({ 
  value, 
  onChange, 
  onContactDetails, 
  contactType = 'both', // 'customer', 'vendor', 'both'
  placeholder = 'Search contacts by name or ID...',
  required = false,
  disabled = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search contacts with React Query
  const { data: searchResults = [], isLoading } = useQuery(
    ['contacts-search', debouncedSearch, contactType],
    () => {
      if (!debouncedSearch.trim()) return [];
      const params = { 
        search: debouncedSearch.trim(),
        page_size: 10
      };
      if (contactType !== 'both') {
        params.type = contactType;
      }
      return masterDataAPI.getContacts(params).then(res => res.data.results || res.data || []);
    },
    {
      enabled: debouncedSearch.length > 0,
      staleTime: 30000, // Cache for 30 seconds
    }
  );

  // Get contact by ID for initial value
  const { data: selectedContact } = useQuery(
    ['contact-detail', value],
    () => masterDataAPI.getContact(value).then(res => res.data),
    {
      enabled: !!value && !searchTerm,
      onSuccess: (contact) => {
        if (onContactDetails) {
          onContactDetails({
            name: contact.name || '',
            email: contact.email || '',
            mobile: contact.mobile || '',
            address: contact.address || '',
            gst_number: contact.gst_number || ''
          });
        }
      }
    }
  );

  // Quick Add Contact Mutation
  const createContactMutation = useMutation(
    (contactData) => masterDataAPI.createContact(contactData),
    {
      onSuccess: (response) => {
        const newContact = response.data;
        toast.success(`Contact "${newContact.name}" created successfully`);
        
        // Update the form with new contact
        onChange(newContact.id);
        if (onContactDetails) {
          onContactDetails({
            name: newContact.name || '',
            email: newContact.email || '',
            mobile: newContact.mobile || '',
            address: newContact.address || '',
            gst_number: newContact.gst_number || ''
          });
        }
        
        // Clear search and close modals
        setSearchTerm(newContact.name);
        setShowQuickAdd(false);
        setIsOpen(false);
        
        // Invalidate and refetch contacts
        queryClient.invalidateQueries(['contacts-search']);
        queryClient.invalidateQueries(['contacts']);
      },
      onError: (error) => {
        console.error('Contact creation error:', error);
        toast.error(error?.response?.data?.error || 'Failed to create contact');
      }
    }
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
    
    // If user clears the input, clear the selection
    if (!newValue) {
      onChange('');
      if (onContactDetails) {
        onContactDetails({ name: '', email: '', mobile: '', address: '', gst_number: '' });
      }
    }
  };

  // Handle contact selection
  const handleSelectContact = (contact) => {
    setSearchTerm(contact.name);
    onChange(contact.id);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onContactDetails) {
      onContactDetails({
        name: contact.name || '',
        email: contact.email || '',
        mobile: contact.mobile || '',
        address: contact.address || '',
        gst_number: contact.gst_number || ''
      });
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
      return;
    }

    const totalOptions = searchResults.length + (searchResults.length === 0 && searchTerm ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalOptions);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalOptions - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectContact(searchResults[selectedIndex]);
        } else if (searchResults.length === 0 && searchTerm) {
          setShowQuickAdd(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set initial search term from selected contact
  useEffect(() => {
    if (selectedContact && !searchTerm) {
      setSearchTerm(selectedContact.name);
    }
  }, [selectedContact, searchTerm]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className={`input pl-10 pr-4 ${required && !value ? 'border-red-300' : ''}`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Search Results */}
          {searchResults.length > 0 ? (
            <div className="py-1">
              {searchResults.map((contact, index) => (
                <div
                  key={contact.id}
                  className={`px-4 py-3 cursor-pointer flex items-start space-x-3 ${
                    index === selectedIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectContact(contact)}
                >
                  <div className="flex-shrink-0">
                    {contact.type === 'customer' ? (
                      <User className="h-5 w-5 text-green-500" />
                    ) : contact.type === 'vendor' ? (
                      <Building2 className="h-5 w-5 text-blue-500" />
                    ) : (
                      <div className="h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-600">B</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      <span className="text-xs text-gray-500 ml-2">ID: {contact.id}</span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      {contact.email && (
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {contact.email}
                        </span>
                      )}
                      {contact.mobile && (
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {contact.mobile}
                        </span>
                      )}
                    </div>
                    {contact.gst_number && (
                      <div className="mt-1 text-xs text-gray-500 flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        GST: {contact.gst_number}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm && !isLoading ? (
            /* No Results - Show Quick Add Option */
            <div className="py-2">
              <div className="px-4 py-2 text-sm text-gray-500">
                No contacts found for "{searchTerm}"
              </div>
              <button
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center space-x-2 ${
                  selectedIndex === 0 ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setShowQuickAdd(true)}
              >
                <Plus className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600 font-medium">
                  Create "{searchTerm}" as new contact
                </span>
              </button>
            </div>
          ) : searchTerm && isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Searching contacts...</span>
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              Start typing to search contacts...
            </div>
          )}
        </div>
      )}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddContactModal
          initialName={searchTerm}
          contactType={contactType}
          onClose={() => setShowQuickAdd(false)}
          onSubmit={(contactData) => createContactMutation.mutate(contactData)}
          isLoading={createContactMutation.isLoading}
        />
      )}
    </div>
  );
};

// Quick Add Contact Modal Component
const QuickAddContactModal = ({ initialName, contactType, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: initialName || '',
    type: contactType === 'both' ? 'customer' : contactType,
    email: '',
    mobile: '',
    gst_number: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.type) newErrors.type = 'Type is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Add Contact</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                className={`input ${errors.name ? 'border-red-300' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter contact name"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Type *
              </label>
              <select
                className={`input ${errors.type ? 'border-red-300' : ''}`}
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                disabled={isLoading || contactType !== 'both'}
              >
                <option value="">Select type</option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="both">Both</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                type="tel"
                className="input"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="+91 9876543210"
                disabled={isLoading}
              />
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number
              </label>
              <input
                type="text"
                className="input font-mono text-sm"
                value={formData.gst_number}
                onChange={(e) => handleChange('gst_number', e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                style={{ textTransform: 'uppercase' }}
                disabled={isLoading}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                className="input"
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Street address"
                disabled={isLoading}
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="City"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="State"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  placeholder="123456"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating...
                  </span>
                ) : (
                  'Create Contact'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AsyncContactSelect;
