import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const MedicinesList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('filter') === 'low-stock') {
      setFilter('low-stock');
    }
  }, [location]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const data = await api.getMedicines();
        setMedicines(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.deleteMedicine(id);
        setMedicines(medicines.filter((medicine) => medicine._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filterMedicines = () => {
    let filtered = medicines;

    if (filter === 'low-stock') {
      filtered = filtered.filter((medicine) => medicine.stock < 10);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((medicine) =>
        medicine.name.toLowerCase().includes(term) ||
        medicine.category.toLowerCase().includes(term) ||
        medicine.manufacturer.toLowerCase().includes(term) ||
        medicine.batchNumber.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'low-stock') {
      navigate('?filter=low-stock');
    } else {
      navigate('');
    }
  };

  const filteredMedicines = filterMedicines();

  if (loading) return <div className="text-center text-gray-500 py-10">Loading medicines...</div>;
  if (error) return <div className="text-center text-red-600 py-10">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold">Medicines</h2>
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search medicines..."
            className="border border-gray-400 px-3 py-2 rounded w-60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-400 px-3 py-2 rounded"
          >
            <option value="all">All</option>
            <option value="low-stock">Low Stock</option>
          </select>
          <Link
            to="/medicines/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Add Medicine
          </Link>
        </div>
      </div>

      {filteredMedicines.length === 0 ? (
        <p className="text-center text-gray-500">No medicines found.</p>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Stock</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Price</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Manufacturer</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Expiry</th>
                <th className="px-4 py-2 text-sm font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMedicines.map((medicine) => (
                <tr
                  key={medicine._id}
                  className={medicine.stock < 10 ? 'bg-yellow-50' : ''}
                >
                  <td className="px-4 py-2">{medicine.name}</td>
                  <td className="px-4 py-2">{medicine.category}</td>
                  <td className="px-4 py-2">{medicine.stock}</td>
                  <td className="px-4 py-2">${medicine.pricePerUnit.toFixed(2)}</td>
                  <td className="px-4 py-2">{medicine.manufacturer}</td>
                  <td className="px-4 py-2">{new Date(medicine.expiryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <Link
                      to={`/medicines/${medicine._id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/medicines/${medicine._id}/edit`}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(medicine._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MedicinesList;
