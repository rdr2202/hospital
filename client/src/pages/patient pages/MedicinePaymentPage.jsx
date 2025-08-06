import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "/src/components/patient components/Layout.jsx";
import axios from "axios";
import moment from "moment";
import { FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaPaypal } from "react-icons/fa";
import config from "../../config";
const MedicinePaymentPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const API_URL = config.API_URL;
  // Payment form state
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });

  useEffect(() => {
    // Fetch appointment details
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/patient/appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        // If already paid, redirect to prescription page
        if (response.data?.medicalPayment === "Yes") {
          navigate(`/prescription/${appointmentId}`);
          return;
        }
        
        setAppointment(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch appointment details");
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardInfo({
      ...cardInfo,
      [name]: value
    });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (paymentMethod === "creditCard") {
      if (!cardInfo.cardNumber || !cardInfo.cardName || !cardInfo.expiryDate || !cardInfo.cvv) {
        alert("Please fill in all required fields");
        return;
      }
    }
    
    try {
      setProcessing(true);
      
      // In a real application, you would process the payment with a payment gateway
      // For this demo, we'll just update the appointment status
      await axios.patch(
        `${API_URL}/api/patient/appointment/${appointmentId}`,
        { medicalPayment: "Yes" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Wait a bit to simulate payment processing
      setTimeout(() => {
        setProcessing(false);
        navigate(`/prescription/${appointmentId}`);
      }, 1500);
      
    } catch (err) {
      setProcessing(false);
      setError(err.response?.data?.message || "Payment processing failed");
    }
  };

  const handleGoBack = () => {
    navigate("/consulthistory");
  };

  // Calculate the payment amount (in a real app, this would come from the backend)
  // For demo purposes, we'll use a fixed amount
  const consultationFee = 50;
  const medicineFee = appointment?.prescriptionCreated ? 25 : 0;
  const totalAmount = consultationFee + medicineFee;

  return (
    <Layout>
      <div className="p-7 max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Back to Consultation History
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Medical Payment</h1>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Payment Summary */}
            <div className="col-span-1 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Payment Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Appointment Date:</span>
                  <span className="font-medium">{moment(appointment?.appointmentDate).format("MMM DD, YYYY")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Slot:</span>
                  <span className="font-medium">{appointment?.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{appointment?.doctor?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consulting For:</span>
                  <span className="font-medium">{appointment?.consultingFor || "N/A"}</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-3">Charges</h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee:</span>
                  <span className="font-medium">${consultationFee.toFixed(2)}</span>
                </div>
                {appointment?.prescriptionCreated && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medicine Fee:</span>
                    <span className="font-medium">${medicineFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                <p>Payment is required to view the complete prescription details.</p>
              </div>
            </div>
            
            {/* Payment Form */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Payment Method</h2>
              
              {/* Payment Method Selection */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange("creditCard")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                    paymentMethod === "creditCard" 
                      ? "bg-blue-50 border-blue-300 text-blue-600" 
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  <FaCreditCard />
                  <span>Credit Card</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange("paypal")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                    paymentMethod === "paypal" 
                      ? "bg-blue-50 border-blue-300 text-blue-600" 
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  <FaPaypal />
                  <span>PayPal</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange("bankTransfer")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                    paymentMethod === "bankTransfer" 
                      ? "bg-blue-50 border-blue-300 text-blue-600" 
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  <FaMoneyBillWave />
                  <span>Bank Transfer</span>
                </button>
              </div>
              
              {/* Credit Card Form */}
              {paymentMethod === "creditCard" && (
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardInfo.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      maxLength="19"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={cardInfo.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardInfo.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        maxLength="5"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardInfo.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>Pay ${totalAmount.toFixed(2)}</>
                    )}
                  </button>
                </form>
              )}
              
              {/* PayPal Option */}
              {paymentMethod === "paypal" && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    You will be redirected to PayPal to complete your payment securely.
                  </p>
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>Continue to PayPal</>
                    )}
                  </button>
                </div>
              )}
              
              {/* Bank Transfer Option */}
              {paymentMethod === "bankTransfer" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-2">Bank Account Details</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><span className="font-medium">Bank Name:</span> Medical Healthcare Bank</p>
                      <p><span className="font-medium">Account Name:</span> Medical Healthcare System</p>
                      <p><span className="font-medium">Account Number:</span> 123456789</p>
                      <p><span className="font-medium">Routing Number:</span> 987654321</p>
                      <p><span className="font-medium">Reference:</span> APPT-{appointmentId.substring(0, 8)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    After making the transfer, click the button below to mark the payment as complete.
                    Our team will verify the payment within 24 hours.
                  </p>
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>Mark Payment as Complete</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MedicinePaymentPage;