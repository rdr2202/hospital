import React, { useState } from "react";
import Layout from "../../components/patient components/Layout";
import delivery from "/src/assets/images/patient images/delivery.png"
import { useNavigate } from "react-router-dom";

const Medicine = () => {
    const [activeTab,setActiveTab]= useState("orders");
    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };
   const navigate = useNavigate();
   const handleTracking = () => {
   navigate('/track')
   }

    return (  
        <div>      
        <Layout>
        <div className="p-6">
            <h1 className="font-bold text-2xl pl-8 pt-8">Your Orders</h1>
            <div className="flex space-x-4 mb-6 p-8">
                    <button
                        onClick={() => handleTabSwitch("orders")}
                        className={`px-4 py-2 rounded-md ${
                          activeTab === "orders" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-200 text-gray-700"}
                          hover:bg-blue-400 hover:text-white`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => handleTabSwitch("notshipped")}
                        className={`px-4 py-2 rounded-md ${
                          activeTab === "notshipped" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-200 text-gray-700"}
                          hover:bg-blue-400 hover:text-white`}
                    >
                        Not yet Shipped
                    </button>
                </div>
                <div className="flex flex-col lg:flex-row justify-start max-h-screen p-4 space-y-6 lg:space-y-0 lg:space-x-12 mt-6">
                <div className="lg:w-1/3"> 
                  <img className="w-full h-auto mx-auto lg:mx-0" src={delivery} alt="Product"  />
                </div>
                <div className="w-full sm:w-2/3">
                {activeTab === "orders" && (
  <div className="px-4 py-6 w-full sm:w-full">
    {/* Search and Filter Row */}
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-12">
      {/* Search Input */}
      <div className="w-full sm:w-full  border-2 rounded-lg">
        <input
          type="text"
          placeholder="Search Orders"
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="w-full sm:w-1/2 sm:text-left">
        <select
          className="w-full sm:w-auto px-4 py-2 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
        </select>
      </div>
    </div>

    {/* Orders Details Row */}
    <div className="p-2 sm:w-full sm:h-full border border-gray-300 rounded-lg shadow-sm bg-white mt-5">
  {/* Top Section: Order Details */}
  <div className="flex flex-row justify-between items-center pb-4 border-b border-gray-300 space-x-4 space-y-4 sm:space-y-0 w-full">
  <div className="w-full sm:w-auto">
    <p className="text-xs text-gray-600 font-semibold">DISPATCHED ON</p>
    <p className="text-sm">20 December 2022</p>
  </div>
  <div className="w-full sm:w-auto">
    <p className="text-xs text-gray-600 font-semibold">TOTAL</p>
    <p className="text-sm">Rs.400</p>
  </div>
  <div className="w-full sm:w-auto">
    <p className="text-xs text-gray-600 font-semibold">DISPATCH TO</p>
    <p className="text-sm text-blue-500">Rita</p>
  </div>
  <div className="w-full sm:w-auto">
    <p className="text-blue-500 text-sm">Invoice</p>
  </div>
</div>

  {/* Middle Section: Delivery Details */}
  <div className="py-4">
    <p className="text-lg font-semibold">Delivered 22 December</p>
    <p className="text-sm text-gray-600">Parcel was handed to resident.</p>
  </div>

  {/* Bottom Section: Product Details */}
  <div className="flex flex-col sm:flex-row sm:space-x-4 items-center">
    {/* Product Image */}
    <img
      className="w-20 h-20 sm:w-25 sm:25 object-cover rounded-lg"
      src={delivery}
      alt="Product"
    />

    {/* Product Description */}
      <p className="text-blue-500 font-semibold">3 Products</p>

  </div>

</div>


  </div>
)}
 
{activeTab === "notshipped" && (
        <div className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white mt-5">
        {/* Top Section: Order Details */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-300">
          <div>
            <p className="text-xs text-gray-600 font-semibold">DISPATCHED ON</p>
            <p className="text-sm">20 December 2022</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">TOTAL</p>
            <p className="text-sm">Rs.400</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">DISPATCH TO</p>
            <p className="text-sm text-blue-500">Rita</p>
          </div>
          <div>
            <p className="text-blue-500 text-sm">Invoice</p>
          </div>
        </div>
      
        {/* Middle Section: Delivery Details */}
        <div className="py-4">
          <p className="text-lg font-semibold"> Expected Delivery 22 December</p>
        </div>
      
        {/* Bottom Section: Product Details */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 items-center">
          {/* Product Image */}
          <img
            className="w-27 h-27 sm:w-20 sm:h-20 object-cover rounded-lg"
            src={delivery}
            alt="Product"
          />
      
          {/* Product Description */}
            <p className="text-blue-500 font-semibold">3 Products</p>
            <button 
            onClick={handleTracking}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-400 hover:text-white">Track Delivery</button>
      
        </div>
      
      </div>
)}
</div>
</div>

 </div>

    </Layout>

        </div>
)
}

export default Medicine ;