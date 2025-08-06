import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true);
        const data = await api.getMedicine(id);
        setMedicine(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.deleteMedicine(id);
        navigate('/medicines');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading medicine details...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  if (!medicine) return <div className="text-center py-10 text-gray-400">Medicine not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{medicine.name}</h2>
        <div className="space-x-2">
          <Link to={`/medicines/${id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Edit
          </Link>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
            Delete
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
        <InfoGrid data={[
          { label: "Description", value: medicine.description || 'N/A' },
          { label: "Category", value: medicine.category },
          { label: "Dosage", value: medicine.dosage },
          { label: "Stock", value: medicine.stock },
          { label: "Price Per Unit", value: `$${medicine.pricePerUnit.toFixed(2)}` },
          { label: "Total Value", value: `$${(medicine.stock * medicine.pricePerUnit).toFixed(2)}` },
        ]} />
      </Section>

      {/* Manufacturer */}
      <Section title="Manufacturer & Batch Information">
        <InfoGrid data={[
          { label: "Manufacturer", value: medicine.manufacturer },
          { label: "Batch Number", value: medicine.batchNumber },
          { label: "Expiry Date", value: new Date(medicine.expiryDate).toLocaleDateString() },
        ]} />
      </Section>

      {/* System Info */}
      <Section title="System Information">
        <InfoGrid data={[
          { label: "Created", value: new Date(medicine.createdAt).toLocaleString() },
          { label: "Last Updated", value: new Date(medicine.updatedAt).toLocaleString() },
        ]} />
      </Section>

      <div className="mt-8">
        <Link to="/medicines" className="inline-block px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition">
          Back to Medicines
        </Link>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <div className="bg-white shadow-md rounded-lg p-4 border">{children}</div>
  </div>
);

const InfoGrid = ({ data }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {data.map(({ label, value }, idx) => (
      <div key={idx}>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    ))}
  </div>
);

export default MedicineDetail;
