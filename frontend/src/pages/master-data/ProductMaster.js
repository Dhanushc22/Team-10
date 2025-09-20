import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { masterDataAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProductMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  const { data: productsData, isLoading } = useQuery(
    ['products', { search: searchTerm, type: filterType }],
    () => masterDataAPI.getProducts({ search: searchTerm, type: filterType }),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(masterDataAPI.createProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      toast.success('Product created');
      reset(); setShowForm(false);
    },
    onError: () => toast.error('Create failed')
  });

  const updateMutation = useMutation(({ id, data }) => masterDataAPI.updateProduct(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      toast.success('Product updated');
      reset(); setShowForm(false); setEditingItem(null);
    },
    onError: () => toast.error('Update failed')
  });

  const deleteMutation = useMutation(masterDataAPI.deleteProduct, {
    onSuccess: () => { queryClient.invalidateQueries('products'); toast.success('Product deleted'); },
    onError: () => toast.error('Delete failed')
  });

  const onSubmit = (data) => {
    if (editingItem) updateMutation.mutate({ id: editingItem.id, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setValue('name', item.name);
    setValue('type', item.type);
    setValue('sales_price', item.sales_price);
    setValue('purchase_price', item.purchase_price);
    setValue('sale_tax_percent', item.sale_tax_percent);
    setValue('purchase_tax_percent', item.purchase_tax_percent);
    setValue('hsn_code', item.hsn_code);
    setValue('category', item.category);
    setValue('description', item.description);
    setShowForm(true);
  };

  const handleDelete = (item) => {
    if (window.confirm('Delete this product?')) deleteMutation.mutate(item.id);
  };

  const items = productsData?.data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Master</h1>
          <p className="text-gray-600">Manage your products, services, and tax rates</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center"><Plus className="h-4 w-4 mr-2"/>New Product</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showForm && (
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingItem ? 'Edit Product' : 'Add Product'}</h3>
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
                  <select {...register('type', { required: 'Type is required' })} className="input">
                    <option value="">Select</option>
                    <option value="goods">Goods</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Sales Price *</label>
                    <input type="number" step="0.01" {...register('sales_price', { required: 'Required' })} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Purchase Price *</label>
                    <input type="number" step="0.01" {...register('purchase_price', { required: 'Required' })} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Sale Tax % *</label>
                    <input type="number" step="0.01" {...register('sale_tax_percent', { required: 'Required' })} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Purchase Tax % *</label>
                    <input type="number" step="0.01" {...register('purchase_tax_percent', { required: 'Required' })} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">HSN Code</label>
                    <input {...register('hsn_code')} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <input {...register('category')} className="input" />
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
            <div className="p-6 border-b border-gray-200">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                  <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Search products..." className="input pl-10" />
                </div>
                <div className="sm:w-48">
                  <select value={filterType} onChange={(e)=>setFilterType(e.target.value)} className="input">
                    <option value="">All Types</option>
                    <option value="goods">Goods</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Sales Price</th>
                    <th>Purchase Price</th>
                    <th>Sales Tax %</th>
                    <th>Purchase Tax %</th>
                    <th>HSN</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="8" className="text-center py-8">Loading...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-8 text-gray-500">No products found</td></tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="font-medium">{item.name}</td>
                        <td className="capitalize">{item.type}</td>
                        <td>₹{item.sales_price}</td>
                        <td>₹{item.purchase_price}</td>
                        <td>{item.sale_tax_percent || '0.00'}%</td>
                        <td>{item.purchase_tax_percent || '0.00'}%</td>
                        <td>{item.hsn_code || '-'}</td>
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

export default ProductMaster;
