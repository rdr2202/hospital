
import config from "../../../config";
const API_URL = `${config.API_URL}/api/inventory`; // Adjust to your backend URL

export const api = {
  // Raw Materials API calls
  getRawMaterials: async () => {
    const response = await fetch(`${API_URL}/raw-materials`);
    if (!response.ok) throw new Error('Failed to fetch raw materials');
    return response.json();
  },
  
  getRawMaterial: async (id) => {
    const response = await fetch(`${API_URL}/raw-materials/${id}`);
    if (!response.ok) throw new Error('Failed to fetch raw material');
    return response.json();
  },
  
  createRawMaterial: async (data) => {
    const response = await fetch(`${API_URL}/raw-materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create raw material');
    return response.json();
  },
  
  updateRawMaterial: async (id, data) => {
    const response = await fetch(`${API_URL}/raw-materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update raw material');
    return response.json();
  },
  
  deleteRawMaterial: async (id) => {
    const response = await fetch(`${API_URL}/raw-materials/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete raw material');
    return response.json();
  },
  
  // Medicines API calls
  getMedicines: async () => {
    const response = await fetch(`${API_URL}/medicines`);
    if (!response.ok) throw new Error('Failed to fetch medicines');
    return response.json();
  },
  
  getMedicine: async (id) => {
    const response = await fetch(`${API_URL}/medicines/${id}`);
    if (!response.ok) throw new Error('Failed to fetch medicine');
    return response.json();
  },
  
  createMedicine: async (data) => {
    console.log("Doing");
    const response = await fetch(`${API_URL}/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create medicine');
    return response.json();
  },
  
  updateMedicine: async (id, data) => {
    const response = await fetch(`${API_URL}/medicines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update medicine');
    return response.json();
  },
  
  deleteMedicine: async (id) => {
    const response = await fetch(`${API_URL}/medicines/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete medicine');
    return response.json();
  },
  
  calculateMedicinePrice: async (data) => {
    const response = await fetch(`${API_URL}/medicines/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to calculate medicine price');
    return response.json();
  }
};