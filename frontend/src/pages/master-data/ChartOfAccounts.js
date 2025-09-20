import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { masterDataAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ChartOfAccounts = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  const { data: accountsData, isLoading } = useQuery('chart-of-accounts', () => masterDataAPI.getChartOfAccounts().then(r => r.data));
  const createMutation = useMutation(masterDataAPI.createChartOfAccount, { onSuccess: ()=>{ queryClient.invalidateQueries('chart-of-accounts'); toast.success('Account created'); reset(); setShowForm(false);} });
  const updateMutation = useMutation(({ id, data }) => masterDataAPI.updateChartOfAccount(id, data), { onSuccess: ()=>{ queryClient.invalidateQueries('chart-of-accounts'); toast.success('Account updated'); reset(); setShowForm(false); setEditingItem(null);} });
  const deleteMutation = useMutation(masterDataAPI.deleteChartOfAccount, { onSuccess: ()=>{ queryClient.invalidateQueries('chart-of-accounts'); toast.success('Account deleted'); } });

  const onSubmit = (data) => { editingItem ? updateMutation.mutate({ id: editingItem.id, data }) : createMutation.mutate(data); };
  const handleEdit = (item) => { setEditingItem(item); ['name','code','type','parent','description','opening_balance','current_balance'].forEach(f=>setValue(f, item[f])); setShowForm(true); };
  const handleDelete = (item) => { if (window.confirm('Delete this account?')) deleteMutation.mutate(item.id); };

  const accounts = accountsData?.results || accountsData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600">Manage your ledger accounts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center"><Plus className="h-4 w-4 mr-2"/>New Account</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showForm && (
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingItem ? 'Edit Account' : 'Add Account'}</h3>
                <button onClick={() => { reset(); setShowForm(false); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input {...register('name', { required: 'Name is required' })} className="input" />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select {...register('type', { required: 'Required' })} className="input">
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="equity">Equity</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Code</label>
                    <input {...register('code')} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Parent ID</label>
                    <input type="number" {...register('parent')} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Opening Balance</label>
                    <input type="number" step="0.01" {...register('opening_balance')} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Balance</label>
                    <input type="number" step="0.01" {...register('current_balance')} className="input" />
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
                    <th>Type</th>
                    <th>Code</th>
                    <th>Balances</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                  ) : (accountsData?.results || accountsData || []).length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No accounts found</td></tr>
                  ) : (
                    (accountsData?.results || accountsData || []).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="font-medium">{item.name}</td>
                        <td>{item.type}</td>
                        <td>{item.code || '-'}</td>
                        <td>₹{item.opening_balance} → ₹{item.current_balance}</td>
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

export default ChartOfAccounts;
