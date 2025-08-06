import React from 'react';
import Layout from '../../components/patient components/Layout';
import Medicine from '/src/assets/images/patient images/Medicine.png';

const Track = () => {
  // Example tracking data
  const trackingDetails = {
    orderId: '123456789',
    productName: '3 Products',
    estimatedDelivery: 'September 15, 2024',
    progress: [
      { status: 'Order Placed', date: 'September 1, 2024', completed: true },
      { status: 'Shipped', date: 'September 2, 2024', completed: true },
      { status: 'Arrived at Facility', date: 'September 10, 2024', completed: true },
      { status: 'Out for Delivery', date: 'September 14, 2024', completed: false },
      { status: 'Delivered', date: null, completed: false },
    ],
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Order Summary */}
        <div className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order #{trackingDetails.orderId}</h2>
          <div className="flex items-center space-x-4">
            <img src={Medicine} alt="Product" className="w-24 h-24  rounded-md" />
            <div>
              <p className="text-lg font-semibold text-gray-700">{trackingDetails.productName} 
              <p className="text-lg font-semibold text-gray-700">
              <strong>Estimated Delivery:</strong> {trackingDetails.estimatedDelivery}
              </p>
              
            </p>
            </div>
          </div>
        </div>  

        {/* Timeline Tracking Progress */}
        <div className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Tracking Progress</h3>
          <div className="relative border-l border-gray-300 pl-4">
            {trackingDetails.progress.map((step, index) => (
              <div key={index} className="mb-8 last:mb-0 relative">
                {/* Circle */}
                <div className={`w-4 h-4 absolute -left-2.5 top-0 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>

                {/* Step content */}
                <div className={`ml-6 ${step.completed ? 'text-green-600' : 'text-gray-600'}`}>
                  <p className="font-medium">{step.status}</p>
                  <p className="text-sm text-gray-500">{step.date || 'Pending'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="flex space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Contact Support
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
            Manage Order
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Track;
