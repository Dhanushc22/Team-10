import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { User, Phone, Shield } from 'lucide-react';
import { authAPI } from '../services/api';

const Profile = () => {
  const { data: profile, refetch } = useQuery('profile', () => authAPI.getProfile().then(r => r.data));

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        mobile: profile.mobile || ''
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation(
    (data) => authAPI.updateProfile(data),
    {
      onSuccess: () => {
        toast.success('Profile updated');
        refetch();
      },
      onError: () => toast.error('Failed to update profile')
    }
  );

  const changePasswordMutation = useMutation(
    (data) => authAPI.changePassword(data),
    {
      onSuccess: () => toast.success('Password changed successfully'),
      onError: (e) => toast.error(e?.response?.data?.detail || 'Failed to change password')
    }
  );

  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    changePasswordMutation.mutate({
      current_password: passwords.current_password,
      new_password: passwords.new_password
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your personal information and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><User className="w-5 h-5 mr-2"/>Profile</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">First Name</label>
                <input value={formData.first_name} onChange={e=>setFormData({...formData, first_name:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Last Name</label>
                <input value={formData.last_name} onChange={e=>setFormData({...formData, last_name:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2"/>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1 flex items-center"><Phone className="w-4 h-4 mr-1"/>Mobile</label>
              <input value={formData.mobile} onChange={e=>setFormData({...formData, mobile:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2"/>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Changes</button>
          </form>
        </div>

        {/* Security */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><Shield className="w-5 h-5 mr-2"/>Security</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Current Password</label>
              <input type="password" value={passwords.current_password} onChange={e=>setPasswords({...passwords, current_password:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">New Password</label>
                <input type="password" value={passwords.new_password} onChange={e=>setPasswords({...passwords, new_password:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
                <input type="password" value={passwords.confirm_password} onChange={e=>setPasswords({...passwords, confirm_password:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2"/>
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;


