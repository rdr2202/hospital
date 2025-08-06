import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/patient components/Layout";

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/patient/patientPayments  ",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPayments(res.data.data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
          Payment History
        </h1>

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : payments.length === 0 ? (
          <p className="text-center text-gray-500">No payments found.</p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const appt = payment.appointmentId;
              return (
                <div
                  key={payment._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
                >
                  <div className="flex justify-between mb-2">
                    <div className="text-lg font-medium text-gray-800">
                      ₹ {payment.amount} {payment.currency}
                    </div>
                    <div
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        payment.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {payment.status}
                    </div>
                  </div>

                  <div className="text-gray-600 text-sm">
                    Appointment with:{" "}
                    <span className="font-medium">
                      {appt?.doctor?.name || "Doctor"}
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm">
                    Date:{" "}
                    <span className="font-medium">
                      {appt?.appointmentDate
                        ? new Date(appt.appointmentDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm mt-2">
                    Payment ID:{" "}
                    <span className="font-mono text-xs text-gray-500">
                      {payment.razorpayPaymentId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentsPage;
