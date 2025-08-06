import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const RawMaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rawMaterial, setRawMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRawMaterial = async () => {
      try {
        setLoading(true);
        const data = await api.getRawMaterial(id);
        setRawMaterial(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRawMaterial();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this raw material?')) {
      try {
        await api.deleteRawMaterial(id);
        navigate('/raw-materials');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="text-center mt-10 text-lg">Loading raw material details...</div>;
  if (error) return <div className="text-red-600 text-center mt-10">Error: {error}</div>;
  if (!rawMaterial) return <div className="text-center mt-10 text-gray-600">Raw material not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{rawMaterial.name}</h2>
        <div className="flex gap-4">
          <Link
            to={`/raw-materials/${id}/edit`}
            className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>

      {rawMaterial.productImage && (
        <div className="mb-6">
          <img
            src={rawMaterial.productImage}
            alt={rawMaterial.name}
            className="max-w-xs rounded-lg shadow"
          />
        </div>
      )}

      <div className="grid gap-8">
        {/* Basic Info */}
        <Section title="📄 Basic Information">
          <Detail label="Type" value={rawMaterial.type} />
          <Detail label="Category" value={rawMaterial.category} />
          {/* <Detail label="Description" value={rawMaterial.description || '—'} /> */}
          <Detail label="Package Size" value={rawMaterial.packageSize || '—'} />
          <Detail label="Unit of Measure" value={rawMaterial.uom || '—'} />
          <Detail
            label="Stock"
            value={`${rawMaterial.currentQuantity} ${rawMaterial.uom}`}
          />
          <Detail
            label="Total Quantity"
            value={`${rawMaterial.quantity} ${rawMaterial.uom}`}
          />
          <Detail
            label="Threshold"
            value={`${rawMaterial.thresholdQuantity}%`}
          />
          <Detail
            label="Cost Per Unit"
            value={`$${Number(rawMaterial.costPerUnit).toFixed(2)}`}
          />
          <Detail
            label="Total Value"
            value={`$${(rawMaterial.quantity * rawMaterial.costPerUnit).toFixed(2)}`}
          />
          <Detail label="Barcode" value={rawMaterial.barcode || '—'} />
        </Section>

        {/* System Info */}
        <Section title="🛠️ System Information">
          <Detail
            label="Created At"
            value={new Date(rawMaterial.createdAt).toLocaleString()}
          />
          <Detail
            label="Last Updated"
            value={new Date(rawMaterial.updatedAt).toLocaleString()}
          />
          <Detail
            label="Expiry Date"
            value={
              rawMaterial.expiryDate
                ? new Date(rawMaterial.expiryDate).toLocaleDateString()
                : '—'
            }
          />
        </Section>
      </div>

      <div className="mt-6">
        <Link
          to="/raw-materials"
          className="inline-block px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          ← Back to Raw Materials
        </Link>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>
    <div className="grid md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-600">{label}</p>
    <p className="text-base font-semibold text-gray-800">{value}</p>
  </div>
);

export default RawMaterialDetail;
