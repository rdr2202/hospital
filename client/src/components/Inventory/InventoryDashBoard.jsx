import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from './services/api';

const InventoryDashboard = () => {
  const [stats, setStats] = useState({
    totalRawMaterials: 0,
    totalMedicines: 0,
    lowStockMedicines: 0,
    expiringRawMaterials: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rawMaterials, medicines] = await Promise.all([
          api.getRawMaterials(),
          api.getMedicines()
        ]);

        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        const lowStockCount = medicines.filter(med => med.stock < 10).length;
        const expiringCount = rawMaterials.filter(
          raw => new Date(raw.expiryDate) < nextMonth
        ).length;

        setStats({
          totalRawMaterials: rawMaterials.length,
          totalMedicines: medicines.length,
          lowStockMedicines: lowStockCount,
          expiringRawMaterials: expiringCount
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10 text-lg font-medium text-gray-600">Loading dashboard data...</div>;
  if (error) return <div className="text-center py-10 text-red-600 font-semibold">Error: {error}</div>;

  return (
    <div className="p-6 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Inventory Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-4 text-center hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-700">Raw Materials</h3>
          <p className="text-2xl font-bold text-blue-600 my-2">{stats.totalRawMaterials}</p>
          <Link to="/raw-materials" className="text-blue-500 hover:underline text-sm">View All</Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 text-center hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-700">Place Order</h3>
          <p className="text-2xl font-bold text-green-600 my-2">{stats.totalRawMaterials}</p>
          <Link to="/order-raw-materials" className="text-green-500 hover:underline text-sm">click to order</Link>
        </div>

        <div className="bg-yellow-100 rounded-2xl shadow p-4 text-center hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-yellow-800">Low Stock Medicines</h3>
          <p className="text-2xl font-bold text-yellow-600 my-2">{stats.lowStockMedicines}</p>
          <Link to="/medicines?filter=low-stock" className="text-yellow-700 hover:underline text-sm">View</Link>
        </div>

        <div className="bg-red-100 rounded-2xl shadow p-4 text-center hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-red-800">Expiring Raw Materials</h3>
          <p className="text-2xl font-bold text-red-600 my-2">{stats.expiringRawMaterials}</p>
          <Link to="/raw-materials?filter=expiring" className="text-red-700 hover:underline text-sm">View</Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/raw-materials/new" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg shadow">Add Raw Material</Link>
          <Link to="/medicines/new" className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded-lg shadow">Add Medicine</Link>
          <Link to="/medicines/calculate-price" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg shadow">Calculate Price</Link>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;