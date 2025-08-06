import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const MedicineForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialState = {
    name: '',
    description: '',
    category: '',
    stock: '',
    batchNumber: '',
    expiryDate: '',
    manufacturer: '',
    pricePerUnit: '',
    dosage: '',
    composition: []
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories] = useState([
    'Antibiotics', 'Analgesics', 'Antidepressants', 'Antidiabetics',
    'Antihistamines', 'Antihypertensives', 'Antipyretics', 'Vitamins'
  ]);
  const [rawMaterials, setRawMaterials] = useState([]);

  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        const data = await api.getRawMaterials();
        setRawMaterials(data);
      } catch (err) {
        console.error('Failed to load raw materials', err);
      }
    };
    fetchRawMaterials();
  }, []);

  useEffect(() => {
    const fetchMedicine = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const data = await api.getMedicine(id);
          const formatted = {
            ...data,
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
    fetchMedicine();
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompositionChange = (index, field, value) => {
    const updated = [...formData.composition];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, composition: updated }));
  };

  const addCompositionRow = () => {
    setFormData((prev) => ({
      ...prev,
      composition: [...prev.composition, { rawMaterial: '', quantity: '' }]
    }));
  };

  const removeCompositionRow = (index) => {
    const updated = [...formData.composition];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, composition: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const dataToSubmit = {
        ...formData,
        stock: Number(formData.stock),
        pricePerUnit: Number(formData.pricePerUnit),
        composition: formData.composition.map((c) => ({
          rawMaterial: c.rawMaterial,
          quantity: Number(c.quantity)
        }))
      };

      if (isEdit) {
        await api.updateMedicine(id, dataToSubmit);
      } else {
        await api.createMedicine(dataToSubmit);
      }

      navigate('/medicines');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading medicine data...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Medicine' : 'Add New Medicine'}</h2>

      {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block font-semibold mb-1">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="input"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block font-semibold mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            className="input"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Category & Dosage */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block font-semibold mb-1">Category</label>
            <select
              id="category"
              name="category"
              className="input"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dosage" className="block font-semibold mb-1">Dosage</label>
            <input
              type="text"
              id="dosage"
              name="dosage"
              className="input"
              value={formData.dosage}
              onChange={handleChange}
              required
              placeholder="e.g., 500mg"
            />
          </div>
        </div>

        {/* Stock & Price */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="stock" className="block font-semibold mb-1">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              className="input"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="pricePerUnit" className="block font-semibold mb-1">Price Per Unit</label>
            <input
              type="number"
              id="pricePerUnit"
              name="pricePerUnit"
              className="input"
              value={formData.pricePerUnit}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Manufacturer & Batch */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="manufacturer" className="block font-semibold mb-1">Manufacturer</label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              className="input"
              value={formData.manufacturer}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="batchNumber" className="block font-semibold mb-1">Batch Number</label>
            <input
              type="text"
              id="batchNumber"
              name="batchNumber"
              className="input"
              value={formData.batchNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <label htmlFor="expiryDate" className="block font-semibold mb-1">Expiry Date</label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            className="input"
            value={formData.expiryDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Composition */}
        <div>
          <label className="block font-semibold mb-2">Composition</label>
          {formData.composition.map((comp, index) => (
            <div key={index} className="flex gap-4 mb-2">
              <select
                value={comp.rawMaterial}
                onChange={(e) => handleCompositionChange(index, 'rawMaterial', e.target.value)}
                className="input flex-1"
                required
              >
                <option value="">Select Raw Material</option>
                {rawMaterials.map((rm) => (
                  <option key={rm._id} value={rm._id}>{rm.name}</option>
                ))}
              </select>
              <input
                type="number"
                value={comp.quantity}
                onChange={(e) => handleCompositionChange(index, 'quantity', e.target.value)}
                className="input w-32"
                required
                placeholder="Qty"
              />
              <button type="button" onClick={() => removeCompositionRow(index)} className="text-red-500">✕</button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCompositionRow}
            className="text-blue-600 mt-2 hover:underline"
          >
            + Add Raw Material
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate('/medicines')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Medicine' : 'Add Medicine'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicineForm;
