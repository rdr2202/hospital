import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const PriceCalculator = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    medicineName: '',
    rawMaterials: [{ materialId: '', quantity: '' }],
    laborCost: '',
    packagingCost: '',
    overheadPercentage: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);

  React.useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        const data = await api.getRawMaterials();
        setRawMaterials(data);
      } catch (err) {
        setError('Failed to load raw materials: ' + err.message);
      }
    };

    fetchRawMaterials();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRawMaterialChange = (index, field, value) => {
    const updatedMaterials = [...formData.rawMaterials];
    updatedMaterials[index][field] = value;

    setFormData(prev => ({
      ...prev,
      rawMaterials: updatedMaterials
    }));
  };

  const addRawMaterial = () => {
    setFormData(prev => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, { materialId: '', quantity: '' }]
    }));
  };

  const removeRawMaterial = (index) => {
    if (formData.rawMaterials.length === 1) return;

    const updatedMaterials = [...formData.rawMaterials];
    updatedMaterials.splice(index, 1);

    setFormData(prev => ({
      ...prev,
      rawMaterials: updatedMaterials
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const dataToSubmit = {
        ...formData,
        laborCost: Number(formData.laborCost),
        packagingCost: Number(formData.packagingCost),
        overheadPercentage: Number(formData.overheadPercentage),
        rawMaterials: formData.rawMaterials.map(item => ({
          materialId: item.materialId,
          quantity: Number(item.quantity)
        }))
      };

      const data = await api.calculateMedicinePrice(dataToSubmit);
      setResult(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Medicine Price Calculator</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Medicine Name</label>
          <input
            type="text"
            name="medicineName"
            value={formData.medicineName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Raw Materials</h3>
          {formData.rawMaterials.map((material, index) => (
            <div key={index} className="flex gap-4 items-end mb-4">
              <div className="flex-1">
                <label className="block mb-1">Raw Material</label>
                <select
                  value={material.materialId}
                  onChange={(e) => handleRawMaterialChange(index, 'materialId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                >
                  <option value="">Select Raw Material</option>
                  {rawMaterials.map(rm => (
                    <option key={rm._id} value={rm._id}>
                      {rm.name} (${rm.costPerUnit}/{rm.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Quantity</label>
                <input
                  type="number"
                  value={material.quantity}
                  onChange={(e) => handleRawMaterialChange(index, 'quantity', e.target.value)}
                  className="w-28 border border-gray-300 rounded-lg p-2"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <button
                type="button"
                className="text-red-600 hover:text-red-800 font-semibold"
                onClick={() => removeRawMaterial(index)}
                disabled={formData.rawMaterials.length === 1}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addRawMaterial}
            className="text-blue-600 hover:underline"
          >
            + Add another raw material
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Additional Costs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Labor Cost ($)</label>
              <input
                type="number"
                name="laborCost"
                value={formData.laborCost}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Packaging Cost ($)</label>
              <input
                type="number"
                name="packagingCost"
                value={formData.packagingCost}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Overhead (%)</label>
              <input
                type="number"
                name="overheadPercentage"
                value={formData.overheadPercentage}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                min="0"
                max="100"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/medicines')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? 'Calculating...' : 'Calculate Price'}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-8 p-6 bg-blue-50 rounded-xl shadow-inner">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Calculation Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>Raw Materials Cost:</strong> ${result.rawMaterialsCost.toFixed(2)}</div>
            <div><strong>Labor Cost:</strong> ${result.laborCost.toFixed(2)}</div>
            <div><strong>Packaging Cost:</strong> ${result.packagingCost.toFixed(2)}</div>
            <div><strong>Overhead Cost:</strong> ${result.overheadCost.toFixed(2)}</div>
            <div className="md:col-span-2 font-bold text-lg">Total Cost: ${result.totalCost.toFixed(2)}</div>
            <div className="md:col-span-2 font-bold text-lg">Recommended Price/Unit: ${result.recommendedPrice.toFixed(2)}</div>
          </div>

          <div className="mt-6">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              onClick={() => {
                navigate('/medicines/new', {
                  state: {
                    initialPrice: result.recommendedPrice,
                    medicineName: formData.medicineName
                  }
                });
              }}
            >
              Use This Price for New Medicine
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;
