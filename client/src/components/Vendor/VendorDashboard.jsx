import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import VendorList from './VendorList';
import { ChevronRight, Plus, Loader, AlertTriangle, Users, Package, DollarSign } from 'lucide-react';

import config from '../../config';
const VendorDashboard = () => {
  const API_URL = config.API_URL;
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalProducts: 0,
    averagePrice: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/vendor/vendors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const vendors = response.data;
        
        // Calculate statistics
        let totalProducts = 0;
        let totalPrice = 0;
        
        vendors.forEach(vendor => {
          totalProducts += vendor.products.length;
          vendor.products.forEach(product => {
            totalPrice += parseFloat(product.rawMaterialPrice);
          });
        });
        
        setStats({
          totalVendors: vendors.length,
          totalProducts,
          averagePrice: totalProducts > 0 ? (totalPrice / totalProducts).toFixed(2) : 0
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard stats');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsDisplay = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-32">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
          <span className="text-amber-700">{error}</span>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Vendors</p>
                <p className="text-white text-3xl font-bold mt-1">{stats.totalVendors}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Products</p>
                <p className="text-white text-3xl font-bold mt-1">{stats.totalProducts}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg. Price</p>
                <p className="text-white text-3xl font-bold mt-1">${stats.averagePrice}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div> */}
      </div>
    );
  };

  return (
    <div className="max-w-full p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendor Management Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor and manage your vendor relationships</p>
        </div>
        <Link 
          to="/vendors/add" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Vendor
        </Link>
      </div>
      
      {/* Stats Section */}
      {statsDisplay()}
      
      {/* Vendor List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Vendor Directory</h2>
          <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center">
            View all 
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
        <div>
          <VendorList />
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;