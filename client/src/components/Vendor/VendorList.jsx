import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../../config';
const API_URL = config.API_URL;
const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem("token");
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/vendors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVendors(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load vendors. Please try again later.');
      setLoading(false);
      toast.error('Error loading vendors');
      console.error('Error fetching vendors:', err);
    }
  };

  const toggleVendorDetails = (vendorId) => {
    if (expandedVendor === vendorId) {
      setExpandedVendor(null);
    } else {
      setExpandedVendor(vendorId);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (vendors.length === 0) {
    return (
      <div className="container mx-auto px-4 mt-10">
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg shadow p-10">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h2>
          <p className="text-gray-500 mb-6">Start by adding your first vendor</p>
          <Link to="/vendors/add" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Vendor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Vendor Management
        </h1>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <Link to="/vendors/add" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition whitespace-nowrap">
            <svg className="w-5 h-5 mr-0 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden md:inline">Add Vendor</span>
          </Link>
        </div>
      </div>
      
      {filteredVendors.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex">
            <svg className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-700">No vendors match your search criteria.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <div key={vendor._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition hover:shadow-lg">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-lg text-gray-800 truncate" title={vendor.name}>
                  {vendor.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${vendor.products.length > 0 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {vendor.products.length} Products
                </span>
              </div>
              
              <div className="p-4">
                <div className="flex items-start">
                  <div className="bg-blue-50 p-3 rounded-full mr-3">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {vendor.phoneNumber}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {vendor.city}, {vendor.state}
                    </div>
                  </div>
                </div>
                
                {expandedVendor === vendor._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Contact Information
                      </h4>
                      <div className="pl-4 text-gray-600">
                        <p className="mb-1"><span className="font-medium">Email:</span> {vendor.email || 'N/A'}</p>
                        <p className="mb-0"><span className="font-medium">Address:</span> {vendor.address}, {vendor.city}, {vendor.state} {vendor.zipCode}, {vendor.country}</p>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Products Offered
                    </h4>
                    
                    {vendor.products.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Raw Material
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {vendor.products.map((product, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {product.rawMaterialName}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                  ${parseFloat(product.rawMaterialPrice).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-sm">No products available</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="px-4 py-3 bg-gray-50 flex gap-2">
                <button 
                  className={`flex-grow px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
                    expandedVendor === vendor._id 
                      ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 focus:ring-gray-500' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                  onClick={() => toggleVendorDetails(vendor._id)}
                >
                  <div className="flex items-center justify-center">
                    <svg className={`w-4 h-4 ${expandedVendor === vendor._id ? 'mr-1' : 'mr-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={expandedVendor === vendor._id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                    {expandedVendor === vendor._id ? 'Hide Details' : 'Show Details'}
                  </div>
                </button>
                
                <Link to={`/vendors/edit/${vendor._id}`} className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition inline-flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1 md:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorList;