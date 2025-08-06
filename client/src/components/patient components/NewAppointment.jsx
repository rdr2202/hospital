import React, { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import config from "../../config";
import Layout from "./Layout";

const API_URL = config.API_URL;

const NewAppointment = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [user, setUser] = useState(null);
  const [reservedAppointment, setReservedAppointment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const [consultingForOptions, setConsultingForOptions] = useState([]);
  const [consultingFor, setConsultingFor] = useState(null);
  const [consultingReason, setConsultingReason] = useState(null);
  const [symptom, setSymptom] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  const today = dayjs();
  const minDate = today;
  const maxDate = today.add(1, "month");

  const timeSlots = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const consultingReasons = [
    "Accidents",
    "Acute Back Pain",
    "Acute Bronchitis",
    "Acute Contact Dermatitis",
    "Acute migraine / headache",
    "Acute Eczema Flare-ups",
    "Acute Kidney Injury",
    "Acute viral fever",
    "Acute Pelvic Inflammatory Disease (PID)",
    "Acute Sinusitis",
    "Acute Urticaria",
    "Alzheimer's Disease",
    "Allergic cough",
    "Allergic skin rashes",
    "Ankylosing Spondylitis",
    "Asthma",
    "Atrial Fibrillation",
    "Bipolar Disorder",
    "Boils, abscess",
    "Breast Cancer",
    "Chronic Bronchitis",
    "Chronic Hepatitis (B and C)",
    "Chronic Kidney Disease",
    "Chronic Migraine",
    "Chronic Obstructive Pulmonary Disease",
    "Colorectal Cancer",
    "Common Cold",
    "Coronary Artery Disease",
    "COVID-19",
    "Crohn's Disease",
    "Croup",
    "Dengue Fever",
    "Diabetes (Type 1 and Type 2)",
    "Diabetic Nephropathy",
    "Epilepsy",
    "Fibromyalgia",
    "Gastroenteritis",
    "Generalized Anxiety Disorder",
    "Glomerulonephritis",
    "Heart Failure",
    "Head injury",
    "Hypertension (High Blood Pressure)",
    "Hyperthyroidism",
    "Hypothyroidism",
    "Injury, cuts, burns, bruise, blow",
    "Impetigo",
    "Influenza (Flu)",
    "Irritable Bowel Syndrome (IBS)",
    "Leukemia",
    "Lung Cancer",
    "Major Depressive Disorder",
    "Malaria",
    "Metabolic Syndrome",
    "Multiple Sclerosis",
    "Nephrolithiasis (Kidney Stones)",
    "Non-Alcoholic Fatty Liver Disease",
    "Osteoarthritis",
    "Osteoporosis",
    "Oral Ulcers",
    "Parkinson's Disease",
    "Peripheral Artery Disease",
    "Polycystic Kidney Disease",
    "Polycystic Ovary Syndrome (PCOS)",
    "Post-Traumatic Stress Disorder (PTSD)",
    "Prostate Cancer",
    "Psoriasis",
    "Pulmonary Hypertension",
    "Rheumatoid Arthritis",
    "Schizophrenia",
    "Scleroderma",
    "Sjogren's Syndrome",
    "Sprains and Strains",
    "Strep Throat",
    "Systemic Lupus Erythematosus (SLE)",
    "Tooth Pain",
    "Trauma",
    "Ulcerative Colitis",
    "Urinary Tract Infection (UTI)",
    "Other",
  ];

  const consultingReasonOptions = consultingReasons.map((reason) => ({
    value: reason,
    label: reason,
  }));

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => console.error("Razorpay script failed to load");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Get user info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch family members and set consultingFor options
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${API_URL}/api/patient/getFamilyMembers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = JSON.parse(atob(token.split(".")[1])).id;
        const options = [
          { value: userId, label: "Self" },
          ...res.data.familyMembers.map((member) => ({
            value: member.id,
            label: member.relationship,
          })),
        ];
        setConsultingForOptions(options);
        setConsultingFor(options[0]); // Default to Self
      } catch (err) {
        console.error("Error fetching family members:", err);
        setErrorMessage("Failed to load family members");
      }
    };
    fetchFamilyMembers();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (startDate) {
        const token = localStorage.getItem("token");
        const appointmentDate = dayjs(startDate).format("YYYY-MM-DD");
        try {
          const res = await axios.post(
            `
            ${API_URL}/api/patient/checkSlots`,
            { appointmentDate },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAvailableSlots(res.data.availableSlots || []);
          setSelectedTime(null); // Reset selected time when date changes
        } catch (err) {
          console.error("Error fetching slots:", err);
          setErrorMessage("Failed to load available slots");
        }
      }
    };
    fetchSlots();
  }, [startDate]);

  // Check appointment status periodically if reserved
  useEffect(() => {
    let interval;
    if (reservedAppointment) {
      interval = setInterval(async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${API_URL}/api/payments/appointment-status/${reservedAppointment.appointmentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.data.status === "confirmed") {
            clearInterval(interval);
            navigate("/home", { state: { bookingSuccess: true } });
          } else if (res.data.isExpired) {
            clearInterval(interval);
            setErrorMessage("Reservation expired. Please try again.");
            setReservedAppointment(null);
          }
        } catch (err) {
          console.error("Error checking appointment status:", err);
        }
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(interval);
  }, [reservedAppointment, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!startDate) errors.date = "Please select a date";
    if (!selectedTime) errors.time = "Please select a time slot";
    if (!consultingFor)
      errors.consultingFor = "Please select consulting person";
    if (!consultingReason)
      errors.consultingReason = "Please select consulting reason";
    if (consultingReason?.value === "Other" && symptom.length < 10) {
      errors.symptom = "Please enter at least 10 characters for symptom";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookClick = () => {
    if (validateForm()) {
      setIsPopupOpen(true);
    }
  };

  const reserveAppointment = async () => {
    setIsProcessing(true);
    setErrorMessage("");
    const token = localStorage.getItem("token");
    const appointmentDate = dayjs(startDate).format("YYYY-MM-DD");

    // Fixed payload - using consultingFor.value instead of the entire object
    const payload = {
      appointmentDate,
      timeSlot: selectedTime,
      consultingFor: consultingFor.value, // Changed this line
      consultingReason: consultingReason.value,
      symptom: consultingReason.value === "Other" ? symptom : "",
    };

    // Debug log to see what's being sent
    console.log("Sending payload:", payload);

    try {
      // Step 1: Reserve the appointment
      const bookRes = await axios.post(
        `${API_URL}/api/patient/bookAppointment`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (bookRes.data.success) {
        setReservedAppointment({
          appointmentId: bookRes.data.appointmentId,
          amount: bookRes.data.amount,
          expiresAt: bookRes.data.expiresAt,
        });
        return bookRes.data;
      } else {
        throw new Error(
          bookRes.data.message || "Failed to reserve appointment"
        );
      }
    } catch (err) {
      console.error("Error reserving appointment:", err);

      // Better error handling
      let errorMsg = "Booking failed. Please try again.";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }

      // Log the full error response for debugging
      console.log("Full error response:", err.response?.data);

      setErrorMessage(errorMsg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const createRazorpayOrder = async (appointmentId, amount) => {
    try {
      const token = localStorage.getItem("token");
      const orderRes = await axios.post(
        `${API_URL}/api/payments/create-order`,
        { amount, appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return orderRes.data.order;
    } catch (err) {
      console.error("Error creating order:", err);
      throw err;
    }
  };

  const verifyPayment = async (paymentResponse, appointmentId) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        appointmentId,
      };

      console.log("🔍 Sending verification request with payload:", payload);

      const verifyRes = await axios.post(
        `${API_URL}/api/payments/verify-payment`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Verification successful:", verifyRes.data);
      return verifyRes.data;
    } catch (err) {
      console.error("❌ Payment verification failed:");
      if (err.response) {
        console.error(
          "📄 Response Data:",
          JSON.stringify(err.response.data, null, 2)
        );
        console.error("📄 Status:", err.response.status);
        console.error("📄 Headers:", err.response.headers);
      } else if (err.request) {
        console.error("📡 No response received. Request was:", err.request);
      } else {
        console.error("⚠ Error setting up request:", err.message);
      }
      throw err;
    }
  };

  const handleConfirmClick = async () => {
    console.log(user.user.name);
    console.log(user.user.email);
    console.log(user.user.phone);
    if (!isRazorpayLoaded) {
      setErrorMessage("Payment system is loading. Please wait...");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Step 1: Reserve the appointment
      const reservation = await reserveAppointment();
      if (!reservation) return;

      // Step 2: Create Razorpay order
      const order = await createRazorpayOrder(
        reservation.appointmentId,
        reservation.amount
      );

      // Step 3: Open Razorpay payment modal
      const options = {
        key: "rzp_test_4yi0hOj6P7akiv",
        amount: order.amount,
        currency: "INR",
        name: "Doctor Consultation",
        description: "Appointment Booking",
        order_id: order.id,
        handler: async (response) => {
          try {
            setPaymentStatus("verifying");
            await verifyPayment(response, reservation.appointmentId);
            setPaymentStatus("verified");
            // The status check useEffect will handle the navigation
          } catch (err) {
            setPaymentStatus("failed");
            setErrorMessage(
              "Payment verification failed. Please contact support."
            );
            console.error("Payment verification error:", err);
          }
        },
        prefill: {
          name: user?.name || "John Doe",
          email: user?.email || "example@gmail.com",
          contact: user?.phone || "90000000000",
        },
        theme: {
          color: "#0e76a8",
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus("cancelled");
            setErrorMessage(
              "Payment was cancelled. Your reservation will expire shortly."
            );
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Booking error:", err);
      if (!err.response) {
        setErrorMessage("Network error. Please check your connection.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setErrorMessage("");
    setIsProcessing(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-bold text-center bg-blue-100 p-3 rounded">
            Book an Appointment
          </h2>

          <div>
            <label className="font-semibold block mb-2">
              Consulting Person
            </label>
            <Select
              options={consultingForOptions}
              value={consultingFor}
              onChange={setConsultingFor}
              placeholder="Select person..."
            />
            {formErrors.consultingFor && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.consultingFor}
              </p>
            )}
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Consulting Reason
            </label>
            <Select
              options={consultingReasonOptions}
              value={consultingReason}
              onChange={setConsultingReason}
              placeholder="Select reason..."
              isSearchable
            />
            {formErrors.consultingReason && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.consultingReason}
              </p>
            )}
          </div>

          {consultingReason?.value === "Other" && (
            <div>
              <label className="font-semibold block mb-2">
                Symptom (required)
              </label>
              <textarea
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                className="w-full border rounded p-2 min-h-[80px]"
                placeholder="Describe your symptom in detail..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {symptom.length}/10 characters minimum
              </p>
              {formErrors.symptom && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.symptom}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={startDate}
              onChange={setStartDate}
              minDate={minDate}
              maxDate={maxDate}
            />
          </LocalizationProvider>
          {formErrors.date && (
            <p className="text-red-500 text-sm">{formErrors.date}</p>
          )}

          <div>
            <label className="font-semibold block mb-2">Pick Your Time</label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  disabled={!availableSlots.includes(time)}
                  className={`p-2 rounded border transition ${
                    selectedTime === time
                      ? "bg-blue-500 text-white"
                      : availableSlots.includes(time)
                      ? "bg-white hover:bg-blue-100"
                      : "bg-gray-200 cursor-not-allowed text-gray-500"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            {formErrors.time && (
              <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>
            )}
          </div>

          <button
            onClick={handleBookClick}
            className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700 transition"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Book Appointment"}
          </button>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Confirm Your Booking</h2>
              <div className="mb-4 space-y-2">
                <p>
                  <strong>Date:</strong> {startDate?.format("DD-MM-YYYY")}
                </p>
                <p>
                  <strong>Time:</strong> {selectedTime}
                </p>
                <p>
                  <strong>Consulting For:</strong> {consultingFor?.label}
                </p>
                <p>
                  <strong>Reason:</strong> {consultingReason?.label}
                </p>
                {consultingReason?.value === "Other" && symptom && (
                  <p>
                    <strong>Symptom:</strong> {symptom}
                  </p>
                )}
                {reservedAppointment && (
                  <p className="text-yellow-600">
                    <strong>Note:</strong> This slot is reserved for you until{" "}
                    {new Date(
                      reservedAppointment.expiresAt
                    ).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {errorMessage && (
                <p
                  className={`mb-4 text-sm ${
                    paymentStatus === "failed"
                      ? "text-red-500"
                      : "text-yellow-600"
                  }`}
                >
                  {errorMessage}
                </p>
              )}

              <div className="flex gap-4 justify-end">
                {!reservedAppointment ? (
                  <>
                    <button
                      onClick={handleConfirmClick}
                      disabled={isProcessing || !isRazorpayLoaded}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing
                        ? "Processing..."
                        : !isRazorpayLoaded
                        ? "Loading Payment..."
                        : "Confirm & Pay"}
                    </button>
                    <button
                      onClick={handlePopupClose}
                      disabled={isProcessing}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handlePopupClose}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewAppointment;
