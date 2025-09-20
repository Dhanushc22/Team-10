import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Search, Filter, Upload, X } from 'lucide-react';
import { masterDataAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ContactMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  // Fetch contacts
  const { data: contactsData, isLoading } = useQuery(
    ['contacts', { search: searchTerm, type: filterType }],
    () => masterDataAPI.getContacts({ search: searchTerm, type: filterType }),
    {
      keepPreviousData: true,
    }
  );

  // Create contact mutation
  const createMutation = useMutation(masterDataAPI.createContact, {
    onSuccess: () => {
      queryClient.invalidateQueries('contacts');
      toast.success('Contact created successfully');
      reset();
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create contact');
    },
  });

  // Update contact mutation
  const updateMutation = useMutation(
    ({ id, data }) => masterDataAPI.updateContact(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contacts');
        toast.success('Contact updated successfully');
        reset();
        setShowForm(false);
        setEditingContact(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update contact');
      },
    }
  );

  // Delete contact mutation
  const deleteMutation = useMutation(masterDataAPI.deleteContact, {
    onSuccess: () => {
      queryClient.invalidateQueries('contacts');
      toast.success('Contact deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete contact');
    },
  });

  const onSubmit = (data) => {
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setValue('name', contact.name);
    setValue('type', contact.type);
    setValue('email', contact.email);
    setValue('mobile', contact.mobile);
    setValue('address', contact.address);
    setValue('city', contact.city);
    setValue('state', contact.state);
    setValue('pincode', contact.pincode);
    setValue('gst_number', contact.gst_number);
    setShowForm(true);
  };

  const handleDelete = (contact) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      deleteMutation.mutate(contact.id);
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setEditingContact(null);
  };

  const contacts = contactsData?.data?.results || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Contacts</h1>
          <p className="text-gray-600">Create and manage your customers and vendors</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Contact
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        {showForm && (
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="input"
                    placeholder="Enter name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    {...register('type', { required: 'Type is required' })}
                    className="input"
                  >
                    <option value="">Select type</option>
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="both">Both</option>
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    {...register('email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="input"
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile
                  </label>
                  <input
                    {...register('mobile')}
                    type="tel"
                    className="input"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    {...register('address')}
                    rows={3}
                    className="input"
                    placeholder="Enter address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      className="input"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      {...register('state')}
                      type="text"
                      className="input"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    {...register('pincode')}
                    type="text"
                    className="input"
                    placeholder="Pincode"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    {...register('gst_number', {
                      pattern: {
                        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                        message: 'Invalid GST number format (e.g., 22AAAAA0000A1Z5)'
                      }
                    })}
                    type="text"
                    className="input"
                    placeholder="e.g., 22AAAAA0000A1Z5"
                    maxLength="15"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.gst_number && (
                    <p className="text-sm text-red-600 mt-1">{errors.gst_number.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    GST format: 2 digits state code + 10 alphanumeric PAN + 1 check digit + Z + 1 code
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="profile-image"
                    />
                    <label
                      htmlFor="profile-image"
                      className="btn btn-secondary flex items-center cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse
                    </label>
                    <span className="text-sm text-gray-500">or</span>
                    <button
                      type="button"
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                  >
                    {createMutation.isLoading || updateMutation.isLoading
                      ? 'Saving...'
                      : editingContact
                      ? 'Update Contact'
                      : 'Save Contact'
                    }
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contact List */}
        <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="card">
            {/* Search and Filter */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="input"
                  >
                    <option value="">All Types</option>
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Table */}
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>GST Number</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : contacts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No contacts found
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-gray-700">
                                {contact.name?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{contact.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${
                            contact.type === 'customer' ? 'status-paid' :
                            contact.type === 'vendor' ? 'status-pending' : 'status-confirmed'
                          }`}>
                            {contact.type?.charAt(0).toUpperCase() + contact.type?.slice(1)}
                          </span>
                        </td>
                        <td className="text-gray-600">{contact.email || '-'}</td>
                        <td className="text-gray-600">{contact.mobile || '-'}</td>
                        <td className="text-gray-600">
                          {contact.gst_number ? (
                            <span className="font-mono text-sm">{contact.gst_number}</span>
                          ) : '-'}
                        </td>
                        <td className="text-gray-600">
                          {contact.address ? (
                            <div>
                              <div className="text-sm">{contact.address}</div>
                              {contact.city && (
                                <div className="text-xs text-gray-500">
                                  {contact.city}, {contact.state} {contact.pincode}
                                </div>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(contact)}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(contact)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMaster;
