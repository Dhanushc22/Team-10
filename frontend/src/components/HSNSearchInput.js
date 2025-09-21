import React, { useState, useEffect, useRef } from 'react';
import { gstAPI } from '../services/gstAPI';

const HSNSearchInput = ({ 
  value = '', 
  onChange, 
  onSelect, 
  placeholder = 'Search HSN code or description...', 
  type = 'product', // 'product', 'service', or 'code'
  className = '',
  disabled = false 
}) => {
  const [searchText, setSearchText] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function with debouncing
  const performSearch = async (text) => {
    const isNumeric = /^\d+$/.test(text);
    const minLen = isNumeric ? 2 : 3;
    if (!text || text.length < minLen) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Try to use real API first
      const response = await gstAPI.search(text, type);
      
      if (response.data && Array.isArray(response.data)) {
        // Check if this is fallback data
        if (response.isFallback) {
          setError('Using offline data - HSN API temporarily unavailable');
        }
        setSuggestions(response.data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('HSN Search Error:', err);
      
      // Try fallback data if API fails
      try {
        const fallbackResponse = await gstAPI.searchWithFallback(text, type);
        if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
          setSuggestions(fallbackResponse.data);
          setShowSuggestions(true);
          setError('Using offline data - HSN API temporarily unavailable');
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          setError('Failed to search HSN codes.');
        }
      } catch (fallbackErr) {
        setError('Failed to search HSN codes. Please try again.');
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    
    if (onChange) {
      onChange(text);
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 500);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const selectedValue = suggestion.hsn_code || suggestion.code || suggestion.hsnCode;
    setSearchText(selectedValue);
    setShowSuggestions(false);
    
    if (onSelect) {
      onSelect(suggestion);
    }
    
    if (onChange) {
      onChange(selectedValue);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchText && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionSelect(suggestion)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {suggestion.hsn_code || suggestion.code || suggestion.hsnCode}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {suggestion.description || suggestion.desc || suggestion.hsnDescription}
                  </div>
                </div>
                {suggestion.gst_rate && (
                  <div className="ml-2 text-sm font-medium text-blue-600">
                    {suggestion.gst_rate}% GST
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && !isLoading && searchText.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
          No HSN codes found for "{searchText}"
        </div>
      )}
    </div>
  );
};

export default HSNSearchInput;