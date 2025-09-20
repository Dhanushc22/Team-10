import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { masterDataAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TaxMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  const { data: taxesData, isLoading } = useQuery('taxes', () => masterDataAPI.getTaxes().then(r => r.data));

  const createMutation = useMutation(masterDataAPI.createTax, {
    onSuccess: () => { queryClient.invalidateQueries('taxes'); toast.success('Tax created'); reset(); setShowForm(false); },
    onError: () => toast.error('Create failed')
  });
  const updateMutation = useMutation(({ id, data }) => masterDataAPI.updateTax(id, data), {
    onSuccess: () => { queryClient.invalidateQueries('taxes'); toast.success('Tax updated'); reset(); setShowForm(false); setEditingItem(null); },
    onError: () => toast.error('Update failed')
  });
  const deleteMutation = useMutation(masterDataAPI.deleteTax, {
    onSuccess: () => { queryClient.invalidateQueries('taxes'); toast.success('Tax deleted'); },
    onError: () => toast.error('Delete failed')
  });

  const onSubmit = (data) => { editingItem ? updateMutation.mutate({ id: editingItem.id, data }) : createMutation.mutate(data); };
  const handleEdit = (item) => { setEditingItem(item); ['name','computation_method','applicable_on','percentage_value','fixed_value','description'].forEach(f=>setValue(f, item[f])); setShowForm(true); };
  const handleDelete = (item) => { if (window.confirm('Delete this tax?')) deleteMutation.mutate(item.id); };

  const items = taxesData?.results || taxesData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Master</h1>
          <p className="text-gray-600">Manage tax rates and configurations</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center"><Plus className="h-4 w-4 mr-2"/>New Tax</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showForm && (
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingItem ? 'Edit Tax' : 'Add Tax'}</h3>
                <button onClick={() => { reset(); setShowForm(false); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input {...register('name', { required: 'Name is required' })} className="input" />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Computation *</label>
                  <select {...register('computation_method', { required: 'Required' })} className="input">
                    <option value="percentage">Percentage</option>
                    <option value="fixed_value">Fixed Value</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Applicable On *</label>
                  <select {...register('applicable_on', { required: 'Required' })} className="input">
                    <option value="sales">Sales</option>
                    <option value="purchase">Purchase</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Percentage %</label>
                    <input type="number" step="0.01" {...register('percentage_value')} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fixed Value</label>
                    <input type="number" step="0.01" {...register('fixed_value')} className="input" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea rows={3} {...register('description')} className="input" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="submit" className="btn btn-primary flex-1">{editingItem ? 'Update' : 'Save'}</button>
                  <button type="button" onClick={() => { reset(); setShowForm(false); setEditingItem(null); }} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Method</th>
                    <th>Applicable</th>
                    <th>Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No taxes found</td></tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="font-medium">{item.name}</td>
                        <td>{item.computation_method}</td>
                        <td>{item.applicable_on}</td>
                        <td>{item.computation_method === 'percentage' ? `${item.percentage_value}%` : `₹${item.fixed_value}`}</td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <button onClick={()=>handleEdit(item)} className="text-primary-600 hover:text-primary-800"><Edit className="h-4 w-4"/></button>
                            <button onClick={()=>handleDelete(item)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4"/></button>
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

export default TaxMaster;
