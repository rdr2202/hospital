import React from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { Line } from "react-chartjs-2"; // Assuming you're using Chart.js
import "chart.js/auto"; // For Chart.js

const AccountsPage = () => {
  const incomeData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Income",
        data: [3000, 4000, 5000, 6000, 4500, 7000, 8000, 7500, 8500, 9000, 10000, 9000], // Example data
        borderColor: "#6293fc",
        backgroundColor: "rgba(119, 161, 252, 0.7)",
        fill: true,
      },
    ],
  };

  const tableData = [
    { department: "Consultation", Jan: 2000, Feb: 2500, Mar: 2200, Apr: 2600, May: 2400, Jun: 3000,Jul: 4000, Aug: 5000 },
    { department: "Medicine", Jan: 1500, Feb: 1800, Mar: 1600, Apr: 2000, May: 2100, Jun: 2200, Jul: 4000, Aug: 5000 },
    { department: "Workshop", Jan: 1500, Feb: 1800, Mar: 1600, Apr: 2000, May: 2100, Jun: 2200, Jul: 4000, Aug: 5000 },
    // Add more departments and months
  ];

  return (
    <div>
        <DoctorLayout>
    <div className="p-7">
      <h1 className="text-2xl font-bold mb-4">Accounts Overview</h1>

      {/* Income Graph */}
      <div className="flex justify-center items-center ">
  <div className="mb-8 p-4 pl-14 bg-sky-50 rounded-lg shadow-md w-full flex justify-between items-center space-x-10 border-1">
    {/* Left Side: Graph */}
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">Income for the Year</h2>
      <Line data={incomeData} />
    </div>

    {/* Right Side: Income, Expenses, and Revenue */}
    <div className="w-2/3 flex flex-col space-y-10 p-9">
      <div className="flex items-center">
        <span className="text-green-500 text-3xl mr-4">💰</span> {/* Icon for Income */}
        <div>
          <h3 className="text-lg font-semibold">Total Income</h3>
          <p className="text-gray-600">₹ 1,200,000</p> {/* Example Income */}
        </div>
      </div>

      <div className="flex items-center">
        <span className="text-red-500 text-3xl mr-4">📉</span> {/* Icon for Expenses */}
        <div>
          <h3 className="text-lg font-semibold">Total Expenses</h3>
          <p className="text-gray-600">₹ 800,000</p> {/* Example Expenses */}
        </div>
      </div>

      <div className="flex items-center">
        <span className="text-blue-500 text-3xl mr-4">📊</span> {/* Icon for Revenue */}
        <div>
          <h3 className="text-lg font-semibold">Total Revenue</h3>
          <p className="text-gray-600">₹ 400,000</p> {/* Example Revenue */}
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Department-wise Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3">Department</th>
              {incomeData.labels.map((month, index) => (
                <th key={index} className="px-6 py-3">{month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="px-6 py-4">{row.department}</td>
                {incomeData.labels.map((month, i) => (
                  <td key={i} className="px-6 py-4">
                    {row[month] || "-"} {/* Default value for missing months */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </DoctorLayout>
    </div>
  );
};

export default AccountsPage;
