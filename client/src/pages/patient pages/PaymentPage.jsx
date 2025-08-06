import React, { useState } from "react";
import Layout from "../../components/patient components/Layout";
import Payment from "/src/assets/images/patient images/Payment.png";
import qrcode from "/src/assets/images/patient images/qrcode.svg";
import tick from "/src/assets/images/patient images/tick.png"

const PaymentPage = () => {
  const [selectedTab, setSelectedTab] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
  });
  const [amount, setAmount] = useState(500);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (selectedTab === "card") {
      if (
        cardDetails.cardNumber &&
        cardDetails.expiryDate &&
        cardDetails.cvv &&
        cardDetails.name
      ) {
        setShowSuccessPopup(true);
      } else {
        alert("Please fill in all card details.");
      }
    } else {
      setShowSuccessPopup(true); // Assume success for QR payment
    }
  };

  const closePopup = () => {
    setShowSuccessPopup(false);
  };

  return (
    <Layout>
      <div className="sm:flex justify-center items-center mt-6 gap-12">
        <img className="flex sm:w-2/5" src={Payment} alt="Payment" />
        <div className="p-8 space-y-6 bg-white rounded-lg shadow-lg sm:w-2/5">
          {/* Amount Display */}
          <div className="mb-2 flex justify-center items-center">
            <label className="block text-xl font-bold text-gray-700">
              Payment
            </label>
          </div>
          <div className="flex justify-center items-center">
            <p className="block text-xl font-bold text-gray-700">Rs.{amount}</p>
          </div>

          {/* Tabs for Payment Mode */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => handleTabChange("card")}
              className={`p-2 w-full text-center border rounded-lg cursor-pointer ${
                selectedTab === "card"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-blue-700 hover:text-white"
              }`}
            >
              Card Payment
            </button>
            <button
              onClick={() => handleTabChange("upi")}
              className={`p-2 w-full text-center border rounded-lg cursor-pointer ${
                selectedTab === "upi" 
                ? "bg-blue-600  text-white" 
                : "bg-gray-200 hover:bg-blue-700 hover:text-white"
              }`}
            >
              UPI/QR
            </button>
          </div>

          {/* Card Payment Form */}
          {selectedTab === "card" && (
            <div>
              <div className="space-y-4">
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Card Number"
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:outline-none"
                />
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="Expiry Date (MM/YY)"
                  value={cardDetails.expiryDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:outline-none"
                />
                <input
                  type="text"
                  name="cvv"
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:outline-none"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Name on Card"
                  value={cardDetails.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* UPI/QR Payment */}
          {selectedTab === "upi" && (
            <div className="flex flex-col justify-center items-center">
              <img className="w-33 h-33" src={qrcode} alt="QR Code" />
              <p className="text-sm text-gray-600">Scan the QR to pay</p>
            </div>
          )}

          {/* Pay Now Button */}
          <div className="mt-6 flex justify-center items-center">
            <button
              onClick={handlePaymentSubmit}
              className="sm:w-1/3 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Pay Now
            </button>
          </div>

          {/* Payment Success Popup */}
          {showSuccessPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="p-6 bg-white rounded-lg shadow-lg">
              <img className="w-33 h-32 mx-auto" src={tick} alt="Congrats" />
                <h3 className="text-lg font-bold mb-2 text-center">Congratulations!</h3>
                <p className="mb-2 text-center">Your payment was successful.</p>
                <button
                  onClick={closePopup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg mx-auto justify-center items-center flex"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentPage;
