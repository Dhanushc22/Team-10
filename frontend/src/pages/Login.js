import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on role
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      const role = storedUser?.role;
      if (role === 'contact') navigate('/contact-dashboard', { replace: true });
      else if (role === 'invoicing_user') navigate('/invoicing-dashboard', { replace: true });
      else navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if (isLogin) {
      const result = await login(data.email, data.password);
      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        const role = result.user?.role;
        if (role === 'contact') navigate('/contact-dashboard', { replace: true });
        else if (role === 'invoicing_user') navigate('/invoicing-dashboard', { replace: true });
        else navigate(from, { replace: true });
      }
    } else {
      const result = await register(data);
      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        const role = result.user?.role;
        if (role === 'contact') navigate('/contact-dashboard', { replace: true });
        else if (role === 'invoicing_user') navigate('/invoicing-dashboard', { replace: true });
        else navigate(from, { replace: true });
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">SA</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? 'Sign in to continue to your account' 
              : 'Sign up to get started with Shiv Accounts Cloud'
            }
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    {...registerForm('username', { required: 'Username is required' })}
                    type="text"
                    className="input mt-1"
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      {...registerForm('first_name', { required: 'First name is required' })}
                      type="text"
                      className="input mt-1"
                      placeholder="First name"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      {...registerForm('last_name', { required: 'Last name is required' })}
                      type="text"
                      className="input mt-1"
                      placeholder="Last name"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                    Mobile
                  </label>
                  <input
                    {...registerForm('mobile')}
                    type="tel"
                    className="input mt-1"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    {...registerForm('role', { required: 'Role is required' })}
                    className="input mt-1"
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="invoicing_user">Invoicing User</option>
                    <option value="contact">Contact</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...registerForm('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input mt-1"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  {...registerForm('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  {...registerForm('password_confirm', { 
                    required: 'Please confirm your password'
                  })}
                  type="password"
                  className="input mt-1"
                  placeholder="Confirm your password"
                />
                {errors.password_confirm && (
                  <p className="mt-1 text-sm text-red-600">{errors.password_confirm.message}</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full btn btn-primary flex items-center justify-center"
            >
              {isLogin ? (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          © 2024 Shiv Accounts Cloud. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
