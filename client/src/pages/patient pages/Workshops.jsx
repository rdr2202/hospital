import React, { useEffect, useState } from 'react';
import { BiCalendarCheck } from 'react-icons/bi';
import axios from 'axios';
import Layout from '../../components/patient components/Layout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emptyState from '../../assets/images/empty-state.png';
import { ConsoleLevel } from '@zegocloud/zego-uikit-prebuilt';
import config from '../../config';
const API_URL = config.API_URL;

const Workshops = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [workshops, setWorkshops] = useState([]);
  const [loadingWorkshopId, setLoadingWorkshopId] = useState(null);
  const [userId, setUserId] = useState('');

  const fetchWorkshops = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/workshop/viewAll`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setWorkshops(response.data.workshops);
      console.log(response.data.workshops);
      setUserId(localStorage.getItem('userId')); // assuming backend sends userId
    } catch (error) {
      console.error('Error fetching workshops:', error);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleBookWorkshop = async (workshopId, fee) => {
    const confirmBooking = window.confirm(`Do you want to register for this workshop?\nFee: ₹${fee}`);
    if (!confirmBooking) return;
  
    try {
      setLoadingWorkshopId(workshopId);
  
      // Request order ID from the server
      const response = await axios.post(`${API_URL}/api/workshop/create-order`, { amount: fee });
      const { orderId, amount } = response.data;
  
      // Initialize Razorpay payment
      const options = {
        key: 'rzp_test_4yi0hOj6P7akiv',  // Razorpay Key ID
        amount: amount,  // Amount in paise
        currency: 'INR',
        name: 'Workshop Payment',
        description: `Payment for ${workshopId}`,
        order_id: orderId,  // Generated order ID
        handler: async function (response) {
          // Payment successful, send payment details to the backend to update the booking
          try {
            // Send payment confirmation to backend
            const paymentDetails = {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              workshopId,
              userId, // Send userId to associate with the booking
            };
  
            console.log(paymentDetails);
            const paymentResponse = await axios.post(`${API_URL}/api/workshop/confirm-booking`, paymentDetails);
            if (paymentResponse.data.success) {
              toast.success('Payment successful and booking confirmed!');
              fetchWorkshops(); // Refresh the workshops list
            } else {
              toast.error('Payment successful, but booking failed!');
            }
          } catch (error) {
            console.error('Error updating booking:', error);
            toast.error('Something went wrong while updating the booking.');
          }
        },
        prefill: {
          name: 'John Doe', // You can use the user's name
          email: 'john@example.com', // Use the user's email
          contact: '1234567890', // User's phone number
        },
        theme: {
          color: '#F37254',  // Razorpay theme color
        },
      };
  
      // Trigger Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoadingWorkshopId(null);
    }
  };  

  const currentDateTime = new Date();

  const isUserRegistered = (workshop) => {
    return workshop.participants?.includes(userId);
  };

  // Upcoming: NOT registered + Date in future
  const upcomingWorkshops = workshops.filter(
    (workshop) =>
      new Date(workshop.scheduledDateTime) > currentDateTime &&
      !isUserRegistered(workshop)
  );

  // Booked: Registered (regardless of date)
  const bookedWorkshops = workshops.filter((workshop) => isUserRegistered(workshop));

  const handleVideoCall = (workshop) => {
    if (workshop?.meetLink) {
      window.open(workshop.meetLink, '_blank');
    } else {
      console.error('No meet link found');
    }
  };  

  return (
    <Layout>
      <ToastContainer />
      <div className="container mx-auto p-4">
        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b">
          {['Booked Appointments', 'Upcoming'].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 ${
                activeTab === tab ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Workshops Section */}
        <div className="w-full">
          {activeTab === 'Upcoming' ? (
            upcomingWorkshops.length > 0 ? (
              <div>
                <h3 className="text-xl font-semibold mb-2">Upcoming Workshops</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingWorkshops.map((workshop, index) => (
                    <div key={index} className="min-w-[200px] bg-white shadow-md rounded-lg p-4">
                      <img
                        src="/src/assets/images/patient images/images.jpg"
                        alt={workshop.title}
                        className="w-2/3 h-40 object-cover rounded-md mb-2 mx-auto"
                      />
                      <h4 className="text-lg font-bold mb-2">{workshop.title}</h4>
                      <p className="text-sm mt-2">{workshop.description}</p>
                      <p className="text-sm text-gray-600 mt-3">
                        {new Date(workshop.scheduledDateTime).toLocaleString()}
                      </p>
                      <p className="text-sm font-bold mt-2">Fee: ₹{workshop.fee}</p>

                      <button
                        disabled={loadingWorkshopId === workshop._id || isUserRegistered(workshop)}
                        className={`flex items-center justify-center gap-2 mt-2 w-full py-2 px-4 rounded transition duration-300 ${
                          isUserRegistered(workshop)
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        onClick={() => handleBookWorkshop(workshop._id, workshop.fee)}
                      >
                        <BiCalendarCheck size={20} />
                        {isUserRegistered(workshop)
                          ? 'Already Registered'
                          : loadingWorkshopId === workshop._id
                          ? 'Booking...'
                          : 'Register'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center flex-col">
                <img
                  src={emptyState} // Add an empty state image path here
                  alt="No upcoming workshops"
                  className="w-1/2 h-auto mb-4"
                />
                <p>No Upcoming Workshops Available</p>
              </div>
            )
          ) : bookedWorkshops.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold mb-2">Booked Appointments</h3>
              <div className="flex overflow-x-auto space-x-4 pb-4">
                {bookedWorkshops.map((workshop, index) => (
                  <div key={index} className="min-w-[200px] bg-white shadow-md rounded-lg p-4">
                    <img
                      src="/src/assets/images/patient images/images.jpg"
                      alt={workshop.title}
                      className="w-2/3 h-40 object-cover rounded-md mb-2 mx-auto"
                    />
                    <h4 className="text-lg font-bold mb-2">{workshop.title}</h4>
                    <p className="text-sm mt-2">{workshop.description}</p>
                    <p className="text-sm mt-3 text-gray-600">
                      {new Date(workshop.scheduledDateTime).toLocaleString()}
                    </p>
                    <p className="text-sm font-bold mt-2">Fee: ₹{workshop.fee}</p>
                    <p className="text-green-600 font-semibold mt-2">✔ Registered</p>
                    <button
                      onClick={() => handleVideoCall(workshop)}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-300"
                    >
                      <BiCalendarCheck size={20} />
                      Attend Workshop
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center flex-col">
              <img
                src="/src/assets/images/empty-state.png" // Add an empty state image path here
                alt="No booked workshops"
                className="w-1/2 h-auto mb-4"
              />
              <p>No Booked Appointments</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Workshops;
