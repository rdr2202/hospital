
import React, { useState, useEffect, useMemo } from "react";
import { FaArrowLeft, FaPlus, FaMinus, FaTrash, FaShoppingCart, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import moment from "moment";
import config from "../../config";
import { useNavigation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const MedicinePreparationView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1); // 1: Select Medicine, 2: Add Raw Materials, 3: Confirm
  const [preparing, setPreparing] = useState(false);
  const navigate = useNavigate();
  const API_URL = config.API_URL; // Replace with your actual API URL
  const onClose =  false;
  const { appointmentId } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch appointment details
        const appointmentResponse = await fetch(`${API_URL}/api/patient/appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!appointmentResponse.ok) {
          throw new Error('Failed to fetch appointment details');
        }
        
        const appointmentData = await appointmentResponse.json();
        setAppointment(appointmentData);
        
        // Fetch prescription
        const prescriptionResponse = await fetch(`${API_URL}/api/prescription/appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!prescriptionResponse.ok) {
          throw new Error('Failed to fetch prescription');
        }
        
        const prescriptionData = await prescriptionResponse.json();
        console.log("prescriptionData", prescriptionData);
        setPrescription(prescriptionData);
        
        // Fetch all raw materials
        const rawMaterialsResponse = await fetch(`${API_URL}/api/inventory/raw-materials`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!rawMaterialsResponse.ok) {
          throw new Error('Failed to fetch raw materials');
        }
        
        const rawMaterialsData = await rawMaterialsResponse.json();
        setRawMaterials(rawMaterialsData);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId, API_URL]);
console.log("prescription:", prescription);
  // Sort raw materials based on prioritization logic
  const sortedRawMaterials = useMemo(() => {
    if (!rawMaterials.length) return [];
    
    return [...rawMaterials].sort((a, b) => {
      // Scenario 3: Expiry based (highest priority)
      const aExpiry = new Date(a.expiryDate);
      const bExpiry = new Date(b.expiryDate);
      
      if (aExpiry < bExpiry) return -1;
      if (aExpiry > bExpiry) return 1;
      
      // Scenario 1: Lowest remaining
      const aRatio = a.currentQuantity / a.quantity;
      const bRatio = b.currentQuantity / b.quantity;
      
      if (aRatio < bRatio) return -1;
      if (aRatio > bRatio) return 1;
      
      // Scenario 2: Smallest unit
      const aSize = parseFloat(a.packageSize) || Infinity;
      const bSize = parseFloat(b.packageSize) || Infinity;
      
      return aSize - bSize;
    });
  }, [rawMaterials]);

  const filteredRawMaterials = useMemo(() => {
    if (!selectedMedicine || !rawMaterials.length) return [];
    
    // Get prescription medicine names to filter by
    const prescriptionMedicineNames = prescription?.prescriptionItems?.map(item => 
      item.name?.toLowerCase() || item.rawMaterialName?.toLowerCase()
    ) || [];
    console.log("prescriptionMedicineNames", prescriptionMedicineNames);
    // Filter raw materials that match prescription medicines
    let filtered = sortedRawMaterials.filter(material => 
      prescriptionMedicineNames.some(name => 
        material.name.toLowerCase().includes(name) || 
        name.includes(material.name.toLowerCase())
      )
    );
    
    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(material => 
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [sortedRawMaterials, searchTerm, selectedMedicine, prescription]);

  const handleSelectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setStep(2);
    // Initialize empty cart for this medicine
    setCart([]);
  };

  const handleAddToCart = (rawMaterial) => {
    // Check if material is already in cart
    const existingItem = cart.find(item => item._id === rawMaterial._id);
    
    if (existingItem) {
      // Increment quantity if already in cart
      setCart(cart.map(item => 
        item._id === rawMaterial._id 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.pricePerUnit } 
          : item
      ));
    } else {
      // Add new item to cart
      setCart([...cart, {
        _id: rawMaterial._id,
        name: rawMaterial.name,
        quantity: 1,
        pricePerUnit: rawMaterial.costPerUnit,
        totalPrice: rawMaterial.costPerUnit,
        available: rawMaterial.currentQuantity,
        uom: rawMaterial.uom,
        expiryDate: rawMaterial.expiryDate
      }]);
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    const material = rawMaterials.find(m => m._id === itemId);
    
    // Ensure quantity is within bounds
    newQuantity = Math.max(1, Math.min(newQuantity, material.currentQuantity));
    
    setCart(cart.map(item => 
      item._id === itemId 
        ? { 
            ...item, 
            quantity: newQuantity, 
            totalPrice: newQuantity * item.pricePerUnit 
          } 
        : item
    ));
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  const handlePrepare = async () => {
    try {
      setPreparing(true);
      const token = localStorage.getItem('token');

      const summaryData = {
      appointmentId: appointment._id,
      prescriptionId: prescription._id,
      patientId: appointment.patientId || prescription.patientId,
      selectedMedicine: selectedMedicine,
      rawMaterialsUsed: cart,
      totalCost: parseFloat(getTotalCost()),
      preparationNotes: `Medicine ${selectedMedicine.rawMaterialName} prepared with ${cart.length} raw materials`
    };
    console.log("summaryData", summaryData);
    // Save preparation summary
    const summaryResponse = await fetch(`${API_URL}/api/medicine-summary/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(summaryData)
    });
    
    if (!summaryResponse.ok) {
      throw new Error('Failed to save preparation summary');
    }
      
      // Create prescription item with raw materials
      const prescriptionItem = {
        medicineName: selectedMedicine.name,
        rawMaterialDetails: cart.map(item => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          totalPrice: item.totalPrice
        })),
        form: selectedMedicine.form || "Tablets",
        uom: selectedMedicine.uom || "Gram",
        frequency: selectedMedicine.frequency,
        Duration: selectedMedicine.duration
      };
      
      // Update prescription with the prepared medicine
      await fetch(`${API_URL}/api/prescription/${prescription._id}/prepare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prescriptionItem })
      });
      
      // Update inventory quantities
      for (const item of cart) {
        await fetch(`${API_URL}/api/inventory/${item._id}/reduce`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: item.quantity })
        });
      }
      
      // Reset and go back to first step
      setPreparing(false);
      setStep(1);
      setSelectedMedicine(null);
      setCart([]);
      
      // Refresh raw materials data
      const rawMaterialsResponse = await fetch(`${API_URL}/api/inventory/raw-materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (rawMaterialsResponse.ok) {
        const rawMaterialsData = await rawMaterialsResponse.json();
        setRawMaterials(rawMaterialsData);
      }
      
      alert("Medicine prepared successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error preparing medicine:", err);
      setPreparing(false);
      alert("Failed to prepare medicine: " + (err.message || "Unknown error"));
    }
  };

  const getTotalCost = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2);
  };

  const isExpiryWarning = (expiryDate) => {
    const expiry = moment(expiryDate);
    const today = moment();
    const daysToExpiry = expiry.diff(today, 'days');
    return daysToExpiry < 30;
  };

  const isLowStock = (current, total) => {
    return (current / total) < 0.2; // Less than 20% remaining
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto bg-white rounded-lg shadow">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition duration-300"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition duration-300"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
        )}
        
        <h1 className="text-2xl font-bold text-gray-800">Medicine Preparation</h1>
        
        <div className="w-24">
          {/* Empty div for spacing */}
        </div>
      </div>
      
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step > 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            2
          </div>
          <div className={`flex-1 h-1 mx-2 ${step > 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            3
          </div>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <div className="text-center w-24">Select Medicine</div>
          <div className="text-center w-32">Add Raw Materials</div>
          <div className="text-center w-24">Confirm & Prepare</div>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Left panel - Prescription view */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Prescription Details</h2>
  {prescription && (
    <div className="text-sm">
      {/* Patient Info */}
      <div className="mb-4">
        <p className="font-medium">Patient: {prescription.patientName}</p>
        <p className="text-gray-600">Appointment ID: {prescription.appointmentId}</p>
        <p className="text-gray-600">Date: {moment(prescription.createdAt).format("MMM DD, YYYY")}</p>
      </div>

      {/* Doctor Info */}
      <div className="mb-4">
        <p className="font-medium">Doctor: Dr. {prescription.doctorName}</p>
        <p className="text-gray-600">{prescription.doctorSpecialty || "Specialist"}</p>
        <p className="text-gray-600">License No: {prescription.doctorLicense}</p>
      </div>

      {/* Prescription Items */}
      <div>
        <p className="font-medium mb-2">Prescription Items:</p>
        {prescription.prescriptionItems?.length > 0 ? (
          <div className="space-y-2">
            {prescription.prescriptionItems.map((item, index) => (
              <div
                key={index}
                className={`p-3 border rounded ${selectedMedicine?._id === item._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => step === 1 && handleSelectMedicine(item)}
              >
                <p className="font-medium">{item.medicineName}</p>
                <div className="grid grid-cols-2 text-xs text-gray-600">
                  <p>Raw Material: {item.rawMaterialName}</p>
                  <p>Form: {item.form}</p>
                  <p>UOM: {item.uom}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Frequency Duration: {item.frequencyDuration}</p>
                </div>
                <p className="mt-1 text-xs text-gray-600">Steps: {item.preparationSteps}</p>
                {step === 1 && (
                  <button
                    className="mt-2 w-full py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectMedicine(item);
                    }}
                  >
                    Prepare this medicine
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No prescription items available</p>
        )}
      </div>
    </div>
  )}
</div>
        </div>
        
        {/* Right panel - Raw Materials / Cart */}
        <div className="col-span-12 lg:col-span-8">
          {step === 1 && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Medicine to Prepare</h2>
              <p className="text-gray-600">Select a medicine from the prescription on the left to begin preparation.</p>
            </div>
          )}
          
          {step === 2 && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Add Raw Materials for {selectedMedicine?.name}
              </h2>
              
              {/* Search box */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search raw materials..."
                  className="w-full p-2 border border-gray-300 rounded"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Raw materials list */}
              <div className="overflow-y-auto max-h-96 mb-4">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRawMaterials.map((material) => (
                      <tr key={material._id} className={`hover:bg-gray-50 ${isExpiryWarning(material.expiryDate) ? 'bg-red-50 border-l-4 border-red-400' : ''}`}>
  <td className="px-4 py-2 whitespace-nowrap">
    <div className="flex items-center">
      {isExpiryWarning(material.expiryDate) && (
        <span className="mr-2 text-red-500 animate-pulse" title="Expires soon!">
          <FaExclamationTriangle />
        </span>
      )}
      <span className={isExpiryWarning(material.expiryDate) ? 'font-semibold text-red-700' : ''}>
        {material.name}
      </span>
      {isLowStock(material.currentQuantity, material.quantity) && (
        <span className="ml-2 text-yellow-500" title="Low stock">
          <FaExclamationTriangle />
        </span>
      )}
    </div>
  </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {material.category || material.type || "N/A"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={isLowStock(material.currentQuantity, material.quantity) ? "text-yellow-600" : "text-gray-700"}>
                            {material.currentQuantity} / {material.quantity} {material.uom}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
      isExpiryWarning(material.expiryDate) 
        ? 'bg-red-100 text-red-800 border border-red-200' 
        : 'text-gray-700'
    }`}>
      {moment(material.expiryDate).format("MMM DD, YYYY")}
      {isExpiryWarning(material.expiryDate) && (
        <span className="ml-1 font-bold">⚠️</span>
      )}
    </div>
  </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          ${material.costPerUnit.toFixed(2)} / {material.uom}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <button 
                            onClick={() => handleAddToCart(material)}
                            disabled={material.currentQuantity <= 0}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md shadow-sm text-white 
                              ${material.currentQuantity <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                          >
                            <FaPlus className="mr-1" /> Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Cart */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <FaShoppingCart className="mr-2" /> Selected Raw Materials
                </h3>
                
                {cart.length === 0 ? (
                  <p className="text-gray-500 italic">No materials added yet</p>
                ) : (
                  <div>
                    <div className="overflow-y-auto max-h-64 mb-4">
                      <table className="min-w-full border-collapse">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {cart.map((item) => (
                            <tr key={item._id}>
                              <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                    className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                                  >
                                    <FaMinus size={12} />
                                  </button>
                                  <input 
                                    type="number" 
                                    value={item.quantity}
                                    min="1"
                                    max={item.available}
                                    onChange={(e) => handleUpdateQuantity(item._id, parseInt(e.target.value) || 1)}
                                    className="w-16 text-center border rounded py-1"
                                  />
                                  <button 
                                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                    disabled={item.quantity >= item.available}
                                    className={`p-1 rounded ${item.quantity >= item.available ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                  >
                                    <FaPlus size={12} />
                                  </button>
                                  <span className="text-sm text-gray-500">/ {item.available} {item.uom}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">${item.totalPrice.toFixed(2)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-center">
                                <button 
                                  onClick={() => handleRemoveFromCart(item._id)}
                                  className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-between items-center border-t pt-4">
                      <div className="text-lg font-semibold">Total: ${getTotalCost()}</div>
                      <button 
                        onClick={() => setStep(3)}
                        disabled={cart.length === 0}
                        className={`px-4 py-2 rounded-md shadow-sm text-white ${
                          cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        Continue to Confirmation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm & Prepare Medicine</h2>
              
              <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-6">
                <h3 className="font-medium text-green-800 mb-2">Medicine to Prepare:</h3>
                <p className="text-lg font-semibold">{selectedMedicine?.name}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-green-800">
                  <p>Dosage: {selectedMedicine?.dosage}</p>
                  <p>Frequency: {selectedMedicine?.frequency}</p>
                  <p>Duration: {selectedMedicine?.duration}</p>
                </div>
              </div>
              
              <div className="border rounded-md p-4 mb-6">
                <h3 className="font-medium mb-2">Raw Materials Summary:</h3>
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <tr key={item._id}>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">{item.quantity} {item.uom}</td>
                        <td className="px-4 py-2">${item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-medium">
                      <td className="px-4 py-2" colSpan="2">Total Cost:</td>
                      <td className="px-4 py-2">${getTotalCost()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Raw Materials
                </button>
                
                <button
                  onClick={handlePrepare}
                  disabled={cart.length === 0 || preparing}
                  className={`flex items-center px-6 py-2 rounded-md shadow-sm text-white ${
                    cart.length === 0 || preparing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {preparing ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" /> Prepare Medicine
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicinePreparationView;