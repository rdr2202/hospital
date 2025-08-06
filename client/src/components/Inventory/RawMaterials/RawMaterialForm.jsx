import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Barcode from 'react-barcode';

const RawMaterialForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialState = {
    name: '',
    type: '',
    category: '',
    packageSize: '',
    uom: '',
    quantity: '',
    currentQuantity: '',
    thresholdQuantity: '80',
    // unit: '',
    // supplier: '',
    // batchNumber: '',
    // purchaseDate: '',
    expiryDate: '',
    // barcode: '',
    productImage: '',
    costPerUnit: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRawMaterial = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const data = await api.getRawMaterial(id);
          const formatted = {
            ...data,
            // purchaseDate: new Date(data.purchaseDate).toISOString().split('T')[0],
            expiryDate: new Date(data.expiryDate).toISOString().split('T')[0]
          };
          setFormData(formatted);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchRawMaterial();
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const dataToSubmit = {
        ...formData,
        quantity: Number(formData.quantity),
        costPerUnit: Number(formData.costPerUnit),
        // barcode: formData.barcode || generateBarcode(),
      };

      if (isEdit) {
        await api.updateRawMaterial(id, dataToSubmit);
      } else {
        await api.createRawMaterial(dataToSubmit);
      }
      navigate('/raw-materials');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const generateBarcode = () => {
    const name = formData.name.replace(/\s+/g, '').toUpperCase(); // Remove spaces, uppercase
    const expiry = formData.expiryDate.replace(/-/g, '');         // Format as YYYYMMDD
  
    const uniqueId = Date.now().toString(36).toUpperCase();       // Unique timestamp
  
    return `RM-${name}-${expiry}-${uniqueId}`;
  };    

  if (loading) return <div className="text-center text-gray-600 py-10">Loading raw material data...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isEdit ? 'Edit Raw Material' : 'Add New Raw Material'}
      </h2>

      {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* type */}
        <div>
          <label htmlFor="type" className="block font-medium text-gray-700">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Packaging">Packaging</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block font-medium text-gray-700">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            rows="5"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            <option value="Pills">Pills</option>
            <option value="Liquid">Liquid</option>
            <option value="Tablets">Tablets</option>
            <option value="Wrapper">Wrapper</option>
          </select>
        </div>

        {/* Package Size */}
        <div>
          <label htmlFor="packageSize" className="block font-medium text-gray-700">Package Size</label>
          <select
            id="packageSize"
            name="packageSize"
            value={formData.packageSize}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select size</option>
            <option value="5 ml">5 ml</option>
            <option value="10 ml">10 ml</option>
            <option value="15 ml">15 ml</option>
          </select>
        </div>

        {/* UOM */}
        <div>
          <label htmlFor="type" className="block font-medium text-gray-700">Unit of Measurement</label>
          <select
            id="uom"
            name="uom"
            value={formData.uom}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select uom</option>
            <option value="ml">ml</option>
            <option value="gram">gram</option>
            <option value="dram">dram</option>
            <option value="piece">piece</option>
          </select>
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="currentQuantity" className="block font-medium text-gray-700">Current Quantity</label>
            <input
              type="number"
              id="currentQuantity"
              name="currentQuantity"
              value={formData.currentQuantity}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="thresholdQuantity" className="block font-medium text-gray-700">Threshold Quantity %:</label>
            <input
              type="number"
              id="thresholdQuantity"
              name="thresholdQuantity"
              value={formData.thresholdQuantity}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Purchase & Expiry Dates */}
        <div>
          <label htmlFor="expiryDate" className="block font-medium text-gray-700">Expiry Date</label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Product Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label htmlFor="productImage" className="block font-medium text-gray-700">Product image</label>
          <input
            type="file"
            id="productImage"
            name="productImage"
            onChange={(e) => setFormData(prev => ({
              ...prev,
              productImage: e.target.files[0]
            }))}
            className="w-full"
          />
        </div>

        {/* Cost Per Unit */}
        <div>
          <label htmlFor="costPerUnit" className="block font-medium text-gray-700">Cost Per Unit</label>
          <input
            type="number"
            id="costPerUnit"
            name="costPerUnit"
            value={formData.costPerUnit}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/raw-materials')}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          {/* {formData.barcode && (
            <div className="mt-6 text-center">
              <p className="font-medium text-gray-700 mb-2">Barcode Preview:</p>
              <div className="inline-block bg-white p-4 shadow border">
                <Barcode value={formData.barcode} />
              </div>
              <button
                onClick={() => window.print()}
                className="mt-4 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
              >
                Print Barcode
              </button>
            </div>
          )} */}
        </div>
      </form>
    </div>
  );
};

export default RawMaterialForm;
