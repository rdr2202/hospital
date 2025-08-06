import React from 'react';
import Doctor from '/src/assets/images/patient images/doctor.jpeg'; // Replace with the actual image path
import Layout from "/src/components/patient components/Layout.jsx";

const AppointmentDetails = () => {
  return (
    <Layout>
      <div className="w-full h-screen mx-auto bg-white shadow-md rounded-lg p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Appointment Details</h2>

        {/* Doctor's Image and Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={Doctor}
              alt="Doctor"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-600 ">Doctor Name</h3>
              <h3 className="text-xl font-semibold">Dr Edalin Hendry</h3>
             
            </div>
          </div>

          {/* Appointment Details */}
          <div className="flex-1 px-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 font-semibold">Type of Consultation</p>
                <p className="font-bold">New Consultation</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Appointment Date & Time</p>
                <p className="font-bold">22 Oct 2024 - 12:00 PM</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 font-semibold">Consulting For</p>
                <p className="font-bold flex items-center">
                  <i className="fas fa-thermometer text-blue-500 mr-2"></i> Fever
                </p>
              </div>

            </div>
          </div>

          {/* Status and Fees */}
          <div className="text-right">
            <span className="bg-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg">
              Completed
            </span>
          </div>
        </div>

        {/* Consultation Payment Section */}
        <div className="border-t pt-4 mt-4">
  <h2 className="text-xl font-bold mb-2">Consultation Payment</h2>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-700">
    <div>
      <p className="font-semibold">Payment ID:</p>
      <p>#PAY123456</p>
    </div>
    <div>
      <p className="font-semibold">Payment Method:</p>
      <p>Credit Card</p>
    </div>
    <div>
      <p className="font-semibold">Payment Date & Time:</p>
      <p>22 Oct 2024 - 12:05 PM</p>
    </div>
    <div>
      <p className="font-semibold">Amount:</p>
      <p>$400</p>
    </div>
  </div>
</div>

{/* Consultation Details Section */}
<div className="border-t pt-4 mt-6">
  <h2 className="text-xl font-bold mb-2">Consultation Details</h2>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-700">
    <div>
      <p className="font-semibold">Consultation Date </p>
      <p>30 Oct 2024 </p>
    </div>
    <div>
      <p className="font-semibold">Time</p>
      <p>12:00 pm </p>
    </div>
    <div>
      <button className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-600">
        Download Prescription
      </button>
    </div>
  </div>
</div>


        {/* Medicine List and Shipment Charges */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-xl font-bold mb-2">Medicine List & Shipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
            <div>
              <p className="font-semibold">Medicine Name:</p>
              <p>Aconitum </p>
            </div>
            <div>
              <p className="font-semibold">Quantity:</p>
              <p>30 tablet</p>
            </div>
            <div>
              <p className="font-semibold">Price:</p>
              <p>300</p>
            </div>
          </div>

          {/* Shipment Charges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700 mt-4">
            <div>
              <p className="font-semibold">Shipment Charges:</p>
              <p>100</p>
            </div>
            <div>
              <p className="font-semibold">Total Amount:</p>
              <p>400</p>
            </div>
          </div>
        </div>

        {/* Medicine Payment Section */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-xl font-bold mb-2">Medicine Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-700">
            <div>
              <p className="font-semibold">Payment ID:</p>
              <p>#PAY123457</p>
            </div>
            <div>
              <p className="font-semibold">Payment Method:</p>
              <p>Debit Card</p>
            </div>
            <div>
              <p className="font-semibold">Payment Date & Time:</p>
              <p>22 Oct 2024 - 12:10 PM</p>
            </div>
            <div>
              <p className="font-semibold">Amount:</p>
              <p>400</p>
            </div>
          </div>
        </div>

        {/* Shipment Tracking Section */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-xl font-bold mb-2">Shipment Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-700">
            <div>
              <p className="font-semibold">Shipment ID:</p>
              <p>#SHIP123456</p>
            </div>
            <div>
              <p className="font-semibold">Delivered Date & Time:</p>
              <p>23 Oct 2024 - 10:00 AM</p>
            </div>
            <div>
              <p className="font-semibold">Delivery Type:</p>
              <p>DTTC</p>
            </div>
            <div>
            <span className="bg-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg">
             Delivered
            </span>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
  <h2 className="text-xl font-bold mb-4">Follow-Up Timeline</h2>
  <div className="flex flex-col space-y-4 text-gray-700">
    {/* Dates and Remaining Days */}
    <div className="flex justify-between text-sm font-semibold">
      <p>Start Date: 25 Oct 2024</p>
      <p className="text-right">End Date: 1 Nov 2024</p>
    </div>

    {/* Progress Bar Timeline */}
    <div className="relative w-2/3 bg-gray-300 h-3 rounded-full">
      {/* Progress filled up until today */}
      <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: "85%" }}></div>
    </div>

    {/* Remaining Days */}
    <div className="flex justify-between text-sm">
      <p>Today: 30 Oct 2024</p>
      <p className="text-right text-blue-600 font-semibold">
        2 days remaining
      </p>
    </div>
  </div>

  {/* Meeting Details */}
  <div className="border-t pt-4 mt-4">
    <h2 className="text-xl font-bold mb-2">Meeting Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-700">
      <div>
        <p className="font-semibold">Date:</p>
        <p>30 Oct 2024</p>
      </div>
      <div>
        <p className="font-semibold">Time:</p>
        <p>10:00 AM</p>
      </div>
      <div>
        <p className="font-semibold">Doctor's Name:</p>
        <p>Dr. Smith</p>
      </div>
      <div>
        <p className="font-semibold">Call Type:</p>
        <p>Video Call</p> {/* Change to "Phone Call" if applicable */}
      </div>
    </div>
  </div>
</div>
<div className="border-t pt-4 mt-6">
  <h2 className="text-xl font-bold mb-4">Notification Timeline</h2>
  <div className="space-y-6">
    
    {/* Timeline Item - Meeting Booked */}
    <div className="flex items-start">
      <div className="w-4 h-4 bg-blue-500 rounded-full mt-1"></div>
      <div className="ml-4">
        <p className="font-semibold">Your Consultation is Booked</p>
        <p className="text-sm text-gray-600">Date: 25 Oct 2024, Time: 10:00 AM</p>
      </div>
    </div>

    {/* Timeline Item - Consultation Happened */}
    <div className="flex items-start">
      <div className="w-4 h-4 bg-green-500 rounded-full mt-1"></div>
      <div className="ml-4">
        <p className="font-semibold">Your Consultation is Completed</p>
        <p className="text-sm text-gray-600">Date: 30 Oct 2024, Time: 10:30 AM</p>
      </div>
    </div>

    {/* Timeline Item - Medicine Preparation */}
    <div className="flex items-start">
      <div className="w-4 h-4 bg-yellow-500 rounded-full mt-1"></div>
      <div className="ml-4">
        <p className="font-semibold">Medicine Preparation Done.</p>
        <p className="text-sm text-gray-600">Date: 31 Oct 2024, Time: 2:00 PM</p>
      </div>
    </div>

    {/* Timeline Item - Amount Paid for Medicine */}
    <div className="flex items-start">
      <div className="w-4 h-4 bg-teal-500 rounded-full mt-1"></div>
      <div className="ml-4">
        <p className="font-semibold">Amount Paid for Medicine done </p>
        <p className="text-sm text-gray-600">Date: 31 Oct 2024, Time: 3:30 PM</p>
        <p className="text-sm text-gray-600">Amount: $50</p>
      </div>
    </div>

    {/* Timeline Item - Expected Delivery Date */}
    <div className="flex items-start">
      <div className="w-4 h-4 bg-purple-500 rounded-full mt-1"></div>
      <div className="ml-4">
        <p className="font-semibold">Expected Delivery Date</p>
        <p className="text-sm text-gray-600">Date: 2 Nov 2024</p>
      </div>
    </div>

    {/* Timeline Item - Parcel Delivered */}
    <div className="flex items-start">
      <div className="w-4 h-4 bg-green-500 rounded-full mt-1"></div>
      <div className="ml-4">
        <p className="font-semibold">Parcel Delivered</p>
        <p className="text-sm text-gray-600">Date: 2 Nov 2024, Time: 10:00 AM</p>
      </div>
    </div>
  </div>
</div>



      </div>
    </Layout>
  );
};

export default AppointmentDetails;
