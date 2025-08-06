import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const RawMaterialsList = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("Raw Material");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("filter") === "expiring") {
      setFilter("expiring");
    }
  }, [location]);

  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        setLoading(true);
        const data = await api.getRawMaterials();
        setRawMaterials(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRawMaterials();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this raw material?")) {
      try {
        await api.deleteRawMaterial(id);
        setRawMaterials(rawMaterials.filter((material) => material._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filterMaterials = () => {
    let filtered = [...rawMaterials];
    
    if (filter === "expiring") {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      filtered = filtered.filter(
        (material) => new Date(material.expiryDate) < nextMonth
      );
    }
  
    if (typeFilter !== "all") {
      filtered = filtered.filter((material) => material.type === typeFilter);
    }
  
    return filtered;
  };  

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    navigate(newFilter === "expiring" ? "?filter=expiring" : "");
  };

  const calculateStockStatus = (material) => {
    const { quantity, currentQuantity, thresholdQuantity } = material;
    if (!quantity || !thresholdQuantity) return null;
    const usedPercentage = ((quantity - currentQuantity) / quantity) * 100;
    return usedPercentage >= thresholdQuantity ? "low" : "ok";
  };

  if (loading)
    return (
      <div className="text-center py-10 text-lg font-medium text-gray-600">
        Loading raw materials...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-600 font-semibold">
        Error: {error}
      </div>
    );

  const filteredMaterials = filterMaterials();

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Raw Materials
        </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="filter" className="text-sm font-medium text-gray-700">Expiry:</label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="expiring">Expiring Soon</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="typeFilter" className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  id="typeFilter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="Raw Material">Raw Material</option>
                  <option value="Packaging">Packaging</option>
                </select>
              </div>
            </div>
          <Link
            to="/raw-materials/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow"
          >
            + Add Raw Material
          </Link>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="text-center text-gray-600 py-10">
          No raw materials found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Package Size</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3 text-left">Threshold</th>
                <th className="px-4 py-3 text-left">Cost/Unit</th>
                <th className="px-4 py-3 text-left">Barcode</th>
                <th className="px-4 py-3 text-left">Expiry Date</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material) => {
                const stockStatus = calculateStockStatus(material);
                const isLow = stockStatus === "low";

                return (
                  <tr
                    key={material._id}
                    className={`border-t ${
                      isLow ? "bg-red-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {material.name}
                    </td>
                    <td className="px-4 py-3">{material.type}</td>
                    <td className="px-4 py-3">{material.category}</td>
                    <td className="px-4 py-3">{material.packageSize}</td>
                    <td className="px-4 py-3">
                      {material.currentQuantity} {material.uom}
                    </td>
                    <td className="px-4 py-3">
                      {material.quantity} {material.uom}
                    </td>
                    <td className="px-4 py-3">{material.thresholdQuantity}%</td>
                    <td className="px-4 py-3">{material.costPerUnit}</td>
                    <td className="px-4 py-3">{material.barcode}</td>
                    <td className="px-4 py-3">
                      {new Date(material.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {material.createdAt
                        ? new Date(material.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="text-red-600 font-semibold">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">Available</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      <Link
                        to={`/raw-materials/${material._id}`}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        View
                      </Link>
                      <Link
                        to={`/raw-materials/${material._id}/edit`}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(material._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RawMaterialsList;
