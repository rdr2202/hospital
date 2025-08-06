import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

import config from '../../config';
const AddVendor = () => {
  const API_URL = config.API_URL;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem('token');
  const [vendor, setVendor] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [products, setProducts] = useState([
    { rawMaterialName: '', rawMaterialPrice: '' }
  ]);

  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendor({ ...vendor, [name]: value });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...products];
    updatedProducts[index][name] = value;
    setProducts(updatedProducts);
    
    // Clear error when field is edited
    if (errors[`products[${index}].${name}`]) {
      const newErrors = { ...errors };
      delete newErrors[`products[${index}].${name}`];
      setErrors(newErrors);
    }
  };

  const addProductField = () => {
    setProducts([...products, { rawMaterialName: '', rawMaterialPrice: '' }]);
  };

  const removeProductField = (index) => {
    if (products.length === 1) {
      return; // Keep at least one product field
    }
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate vendor fields
    if (!vendor.name.trim()) {
      newErrors.name = 'Vendor name is required';
    } else if (vendor.name.length < 2 || vendor.name.length > 100) {
      newErrors.name = 'Name must be between 2 and 100 characters';
    }
    
    if (!vendor.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(vendor.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (vendor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendor.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!vendor.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!vendor.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!vendor.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!vendor.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(vendor.zipCode)) {
      newErrors.zipCode = 'Please enter a valid zip code';
    }
    
    if (!vendor.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    // Validate products
    products.forEach((product, index) => {
      if (!product.rawMaterialName.trim()) {
        newErrors[`products[${index}].rawMaterialName`] = 'Material name is required';
      }
      
      if (!product.rawMaterialPrice) {
        newErrors[`products[${index}].rawMaterialPrice`] = 'Price is required';
      } else if (isNaN(parseFloat(product.rawMaterialPrice)) || parseFloat(product.rawMaterialPrice) <= 0) {
        newErrors[`products[${index}].rawMaterialPrice`] = 'Price must be a positive number';
      }
    });
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/vendor/vendors`, {
        vendor,
        products
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (response.status === 201) {
        toast.success('Vendor added successfully!');
        navigate('/vendors');
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'Error adding vendor. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h1 className="text-xl font-bold text-white">Add New Vendor</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          {/* Vendor Details Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4 border-b pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Vendor Details</h2>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vendor Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={vendor.name}
                      onChange={handleVendorChange}
                      placeholder="Enter vendor name"
                      className={`pl-10 w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                
                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={vendor.phoneNumber}
                      onChange={handleVendorChange}
                      placeholder="e.g. (123) 456-7890"
                      className={`pl-10 w-full rounded-md border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3`}
                    />
                  </div>
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={vendor.email}
                      onChange={handleVendorChange}
                      placeholder="vendor@example.com"
                      className={`pl-10 w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={vendor.address}
                      onChange={handleVendorChange}
                      placeholder="Street address"
                      className={`pl-10 w-full rounded-md border ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3`}
                    />
                  </div>
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
                
                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={vendor.city}
                    onChange={handleVendorChange}
                    placeholder="City"
                    className={`w-full rounded-md border ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3`}
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>
                
                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={vendor.state}
                    onChange={handleVendorChange}
                    placeholder="State"
                    className={`w-full rounded-md border ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3`}
                  />
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                </div>
                
                {/* Zip Code */}
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={vendor.zipCode}
                    onChange={handleVendorChange}
                    placeholder="e.g. 12345"
                    className={`w-full rounded-md border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3`}
                  />
                  {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                </div>
                
                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={vendor.country}
                    onChange={handleVendorChange}
                    placeholder="Country"
                    className={`w-full rounded-md border ${errors.country ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3`}
                  />
                  {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4 border-b pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Products Offered</h2>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              {products.map((product, index) => (
                <div key={index} className="mb-4 bg-white p-4 rounded-lg shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label htmlFor={`rawMaterialName${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Raw Material Name<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id={`rawMaterialName${index}`}
                          name="rawMaterialName"
                          value={product.rawMaterialName}
                          onChange={(e) => handleProductChange(index, e)}
                          placeholder="Enter material name"
                          className={`pl-10 w-full rounded-md border ${errors[`products[${index}].rawMaterialName`] ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3`}
                        />
                      </div>
                      {errors[`products[${index}].rawMaterialName`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`products[${index}].rawMaterialName`]}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-5">
                      <label htmlFor={`rawMaterialPrice${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Price<span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          id={`rawMaterialPrice${index}`}
                          name="rawMaterialPrice"
                          value={product.rawMaterialPrice}
                          onChange={(e) => handleProductChange(index, e)}
                          placeholder="0.00"
                          className={`pl-8 w-full rounded-md border ${errors[`products[${index}].rawMaterialPrice`] ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3`}
                        />
                      </div>
                      {errors[`products[${index}].rawMaterialPrice`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`products[${index}].rawMaterialPrice`]}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        className={`w-full px-4 py-2 text-sm font-medium ${products.length === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'} rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                        onClick={() => removeProductField(index)}
                        disabled={products.length === 1}
                      >
                        <div className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={addProductField}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Product
                </button>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Vendor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendor;