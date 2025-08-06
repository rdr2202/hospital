import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const OrderRawMaterials = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [vendorComparisons, setVendorComparisons] = useState({});
  const [selectedVendors, setSelectedVendors] = useState({});
  const [orderSummary, setOrderSummary] = useState({
    materials: [],
    totalCost: 0,
    vendors: []
  });

  // Fetch raw materials on component mount
  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        setLoading(true);
        const data = await api.getRawMaterials();
        
        // Sort materials to put low stock items on top
        const sortedMaterials = [...data].sort((a, b) => {
          const aStatus = calculateStockStatus(a);
          const bStatus = calculateStockStatus(b);
          
          if (aStatus === "low" && bStatus !== "low") return -1;
          if (aStatus !== "low" && bStatus === "low") return 1;
          return 0;
        });
        
        setRawMaterials(sortedMaterials);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRawMaterials();
  }, []);

  // Fetch vendor price data when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && selectedMaterials.length > 0) {
      fetchVendorPrices();
    }
  }, [currentStep, selectedMaterials]);

  const calculateStockStatus = (material) => {
    const { quantity, currentQuantity, thresholdQuantity } = material;
    if (!quantity || !thresholdQuantity) return null;
    const usedPercentage = ((quantity - currentQuantity) / quantity) * 100;
    return usedPercentage >= thresholdQuantity ? "low" : "ok";
  };

  const handleMaterialSelect = (material) => {
    // Check if material is already selected
    const isSelected = selectedMaterials.some(item => item._id === material._id);
    
    if (isSelected) {
      // Remove from selection
      setSelectedMaterials(selectedMaterials.filter(item => item._id !== material._id));
    } else {
      // Add to selection with initial order quantity of 1
      setSelectedMaterials([...selectedMaterials, { ...material, orderQuantity: 1 }]);
    }
  };

  const handleQuantityChange = (materialId, quantity) => {
    const updatedMaterials = selectedMaterials.map(material => {
      if (material._id === materialId) {
        return { ...material, orderQuantity: parseInt(quantity) || 1 };
      }
      return material;
    });
    setSelectedMaterials(updatedMaterials);
  };

  const fetchVendorPrices = async () => {
    try {
      setLoading(true);
      
      // Get vendor information for selected materials
      const vendors = await api.getVendors();
      setVendors(vendors);
      
      // Create a comparison object for each material
      const comparisons = {};
      
      // For each selected material, find vendors who supply it
      selectedMaterials.forEach(material => {
        comparisons[material._id] = [];
        
        vendors.forEach(vendor => {
          const vendorProduct = vendor.products.find(
            product => product.rawMaterialName === material.name
          );
          
          if (vendorProduct) {
            comparisons[material._id].push({
              vendorId: vendor._id,
              vendorName: vendor.name,
              price: vendorProduct.rawMaterialPrice,
              totalPrice: vendorProduct.rawMaterialPrice * material.orderQuantity
            });
          }
        });
        
        // Sort by price (lowest first)
        comparisons[material._id].sort((a, b) => a.price - b.price);
      });
      
      setVendorComparisons(comparisons);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleVendorSelect = (materialId, vendorId) => {
    setSelectedVendors({
      ...selectedVendors,
      [materialId]: vendorId
    });
  };

  const generateOrderSummary = () => {
    const vendorOrders = {};
    let totalOrderCost = 0;
    
    // Group materials by vendor
    selectedMaterials.forEach(material => {
      const vendorId = selectedVendors[material._id];
      if (!vendorId) return;
      
      const vendorInfo = vendors.find(v => v._id === vendorId);
      const vendorProduct = vendorInfo.products.find(
        p => p.rawMaterialName === material.name
      );
      
      if (!vendorOrders[vendorId]) {
        vendorOrders[vendorId] = {
          vendorName: vendorInfo.name,
          vendorId: vendorId,
          items: [],
          subtotal: 0
        };
      }
      
      const itemTotal = vendorProduct.rawMaterialPrice * material.orderQuantity;
      vendorOrders[vendorId].items.push({
        materialId: material._id,
        materialName: material.name,
        quantity: material.orderQuantity,
        unitPrice: vendorProduct.rawMaterialPrice,
        total: itemTotal
      });
      
      vendorOrders[vendorId].subtotal += itemTotal;
      totalOrderCost += itemTotal;
    });
    
    setOrderSummary({
      materials: selectedMaterials,
      totalCost: totalOrderCost,
      vendors: Object.values(vendorOrders)
    });
  };

  const handleSubmitOrder = async () => {
    try {
      setLoading(true);
      
      // Create order objects for each vendor
      const orderPromises = orderSummary.vendors.map(vendorOrder => {
        return api.createOrder({
          vendorId: vendorOrder.vendorId,
          items: vendorOrder.items,
          totalAmount: vendorOrder.subtotal,
          status: "pending"
        });
      });
      
      await Promise.all(orderPromises);
      setLoading(false);
      
      // Navigate back to raw materials page or show success message
      alert("Order placed successfully!");
      navigate("/raw-materials");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && selectedMaterials.length === 0) {
      alert("Please select at least one material to order");
      return;
    }
    
    if (currentStep === 2) {
      // Check if all materials have vendors selected
      const allVendorsSelected = selectedMaterials.every(
        material => selectedVendors[material._id]
      );
      
      if (!allVendorsSelected) {
        alert("Please select a vendor for each material");
        return;
      }
      
      generateOrderSummary();
    }
    
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (loading && currentStep === 1)
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

  // Step 1: Select Raw Materials
  const renderSelectMaterialsStep = () => (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Step 1: Select Raw Materials to Order
      </h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {selectedMaterials.length} items selected
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/raw-materials")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              disabled={selectedMaterials.length === 0}
            >
              Next: Compare Prices
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-3 text-left">Select</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Current Stock</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Order Quantity</th>
            </tr>
          </thead>
          <tbody>
            {rawMaterials.map((material) => {
              const stockStatus = calculateStockStatus(material);
              const isLow = stockStatus === "low";
              const isSelected = selectedMaterials.some(item => item._id === material._id);
              const selectedMaterial = selectedMaterials.find(item => item._id === material._id);

              return (
                <tr
                  key={material._id}
                  className={`border-t ${
                    isLow ? "bg-red-50" : isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleMaterialSelect(material)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {material.name}
                  </td>
                  <td className="px-4 py-3">{material.type}</td>
                  <td className="px-4 py-3">
                    {material.currentQuantity} {material.uom}
                  </td>
                  <td className="px-4 py-3">
                    {isLow ? (
                      <span className="text-red-600 font-semibold">Low Stock</span>
                    ) : (
                      <span className="text-green-600 font-medium">Available</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isSelected && (
                      <input
                        type="number"
                        min="1"
                        value={selectedMaterial.orderQuantity}
                        onChange={(e) => handleQuantityChange(material._id, e.target.value)}
                        className="w-20 px-2 py-1 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Step 2: Compare Vendor Prices
  const renderComparePricesStep = () => (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Step 2: Compare Vendor Prices
      </h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Select the best vendor for each material
          </div>
          <div className="flex space-x-2">
            <button
              onClick={prevStep}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Next: Order Summary
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10 text-lg font-medium text-gray-600">
          Loading vendor information...
        </div>
      ) : (
        <div className="space-y-8">
          {selectedMaterials.map((material) => (
            <div key={material._id} className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-3">{material.name}</h3>
              <p className="mb-3 text-gray-600">
                Order Quantity: {material.orderQuantity} {material.uom}
              </p>
              
              {vendorComparisons[material._id]?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="px-4 py-3 text-left">Select</th>
                        <th className="px-4 py-3 text-left">Vendor</th>
                        <th className="px-4 py-3 text-left">Price per {material.uom}</th>
                        <th className="px-4 py-3 text-left">Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorComparisons[material._id].map((vendorOption) => {
                        const isSelected = selectedVendors[material._id] === vendorOption.vendorId;
                        const isBestPrice = vendorOption === vendorComparisons[material._id][0];
                        
                        return (
                          <tr
                            key={`${material._id}-${vendorOption.vendorId}`}
                            className={`border-t ${
                              isSelected ? "bg-blue-50" : isBestPrice ? "bg-green-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="radio"
                                name={`vendor-${material._id}`}
                                checked={isSelected}
                                onChange={() => handleVendorSelect(material._id, vendorOption.vendorId)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {vendorOption.vendorName}
                            </td>
                            <td className="px-4 py-3">
                              ${vendorOption.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              ${vendorOption.totalPrice.toFixed(2)}
                              {isBestPrice && (
                                <span className="ml-2 text-green-600 text-xs font-semibold">
                                  BEST PRICE
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-red-600">
                  No vendors available for this material
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Step 3: Order Summary
  const renderOrderSummaryStep = () => (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Step 3: Order Summary
      </h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Review your order before submitting
          </div>
          <div className="flex space-x-2">
            <button
              onClick={prevStep}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={handleSubmitOrder}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit Order"}
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {orderSummary.vendors.map((vendorOrder) => (
          <div key={vendorOrder.vendorId} className="border rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-3">
              Vendor: {vendorOrder.vendorName}
            </h3>
            
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-4 py-3 text-left">Material</th>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-left">Unit Price</th>
                    <th className="px-4 py-3 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorOrder.items.map((item) => (
                    <tr key={item.materialId} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.materialName}
                      </td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="3" className="px-4 py-3 text-right font-semibold">
                      Subtotal:
                    </td>
                    <td className="px-4 py-3 font-bold">
                      ${vendorOrder.subtotal.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
        
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Total Order Value:</span>
            <span className="text-xl font-bold text-blue-700">
              ${orderSummary.totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render function
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Order Raw Materials</h1>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}>
              1
            </div>
            <div className="ml-2 font-medium">Select Materials</div>
          </div>
          <div className={`flex-1 h-1 mx-4 ${
            currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
          }`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}>
              2
            </div>
            <div className="ml-2 font-medium">Compare Prices</div>
          </div>
          <div className={`flex-1 h-1 mx-4 ${
            currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
          }`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}>
              3
            </div>
            <div className="ml-2 font-medium">Order Summary</div>
          </div>
        </div>
      </div>
      
      {/* Step Content */}
      {currentStep === 1 && renderSelectMaterialsStep()}
      {currentStep === 2 && renderComparePricesStep()}
      {currentStep === 3 && renderOrderSummaryStep()}
    </div>
  );
};

export default OrderRawMaterials;