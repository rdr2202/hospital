import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

import config from '../../config';
const EditVendor = () => {
  const API_URL = config.API_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vendor, setVendor] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/vendor/vendors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const vendorData = response.data;
      setVendor({
        name: vendorData.name || '',
        phoneNumber: vendorData.phoneNumber || '',
        email: vendorData.email || '',
        address: vendorData.address || '',
        city: vendorData.city || '',
        state: vendorData.state || '',
        zipCode: vendorData.zipCode || '',
        country: vendorData.country || '',
      });
      
      setProducts(vendorData.products || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load vendor details. Please try again.');
      setLoading(false);
      toast.error('Error loading vendor details');
      console.error('Error fetching vendor details:', err);
    }
  };

  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([...products, { rawMaterialName: '', rawMaterialPrice: '' }]);
  };

  const removeProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!vendor.name || !vendor.phoneNumber) {
      toast.error('Vendor name and phone number are required');
      return;
    }
    
    // Validate products
    const invalidProducts = products.filter(product => 
      !product.rawMaterialName || 
      !product.rawMaterialPrice || 
      isNaN(parseFloat(product.rawMaterialPrice))
    );
    
    if (invalidProducts.length > 0) {
      toast.error('All products must have a name and valid price');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Format the request body to match backend expectations
      const requestBody = {
        vendor: vendor,
        products: products
      };
      
      await axios.patch(`${API_URL}/api/vendor/vendors/${id}`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      toast.success('Vendor updated successfully');
      navigate('/vendors'); // Navigate back to vendor list
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update vendor';
      toast.error(errorMessage);
      console.error('Error updating vendor:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 mt-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 mt-10">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Vendor
          </h1>
          <Link to="/vendors" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition inline-flex items-center text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Vendors
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Vendor Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={vendor.name}
                  onChange={handleVendorChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Company name"
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={vendor.phoneNumber}
                  onChange={handleVendorChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Phone number"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={vendor.email}
                  onChange={handleVendorChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email address"
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={vendor.address}
                  onChange={handleVendorChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Street address"
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={vendor.city}
                  onChange={handleVendorChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={vendor.state}
                  onChange={handleVendorChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="State/Province"
                />
              </div>
              
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={vendor.zipCode}
                  onChange={handleVendorChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ZIP/Postal Code"
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={vendor.country}
                  onChange={handleVendorChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Products Offered</h2>
              <button
                type="button"
                onClick={addProduct}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </button>
            </div>
            
            {products.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
                No products added yet. Click "Add Product" to add materials offered by this vendor.
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md relative">
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 focus:outline-none"
                      aria-label="Remove product"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`product-name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Raw Material Name*
                        </label>
                        <input
                          type="text"
                          id={`product-name-${index}`}
                          value={product.rawMaterialName || ''}
                          onChange={(e) => handleProductChange(index, 'rawMaterialName', e.target.value)}
                          required
                          className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Material name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`product-price-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Price (USD)*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            type="number"
                            id={`product-price-${index}`}
                            value={product.rawMaterialPrice || ''}
                            onChange={(e) => handleProductChange(index, 'rawMaterialPrice', e.target.value)}
                            required
                            step="0.01"
                            min="0"
                            className="w-full rounded-md border border-gray-300 shadow-sm pl-7 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <Link
              to="/vendors"
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVendor;