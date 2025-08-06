import React from "react";

const Payslip = () => {
  return (
    <div className="max-w-4xl mx-auto border border-gray-300 p-8 mt-10">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Payslip</h1>
        <p className="text-sm">Company Name: ABC Pvt Ltd</p>
        <p className="text-sm">Address: 123 Main Street, City, Country</p>
      </div>

      {/* Employee Details */}
      <div className="mb-6">
        <table className="table-auto w-full text-sm">
          <tbody>
            <tr>
              <td className="font-medium">Date of Joining:</td>
              <td>2024-01-15</td>
              <td className="font-medium">Employee Name:</td>
              <td>John Doe</td>
            </tr>
            <tr>
              <td className="font-medium">Pay Period:</td>
              <td>November 2024</td>
              <td className="font-medium">Designation:</td>
              <td>Software Engineer</td>
            </tr>
            <tr>
              <td className="font-medium">Total Working Days:</td>
              <td>30</td>
              <td className="font-medium">Total Worked Days:</td>
              <td>28</td>
            </tr>
            <tr>
              <td className="font-medium">Department:</td>
              <td>IT</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Earnings Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Earnings</h3>
        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
  <tr>
    <td className="border border-gray-300 p-2">Basic Salary</td>
    <td className="border border-gray-300 p-2">20,000</td>
  </tr>
  <tr>
    <td className="border border-gray-300 p-2">House Rent Allowance</td>
    <td className="border border-gray-300 p-2">5,000</td>
  </tr>
  <tr>
    <td className="border border-gray-300 p-2">Transport Allowance</td>
    <td className="border border-gray-300 p-2">2,000</td>
  </tr>
  <tr>
    <td className="border border-gray-300 p-2">Bonus</td>
    <td className="border border-gray-300 p-2">3,000</td>
  </tr>
  <tr>
    <td className="border border-gray-300 p-2 text-right font-bold">Gross Pay</td>
    <td className="border border-gray-300 p-2 font-bold">₹30,000</td>
  </tr>
</tbody>

        </table>
      </div>

     
  

      {/* Deductions Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Deductions</h3>
        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Provident Fund</td>
              <td className="border border-gray-300 p-2">2,000</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Professional Tax</td>
              <td className="border border-gray-300 p-2">500</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Loan</td>
              <td className="border border-gray-300 p-2">1,000</td>
            </tr>
            <tr>
    <td className="border border-gray-300 p-2 text-right font-bold">Total Deduction</td>
    <td className="border border-gray-300 p-2 font-bold">₹3,500</td>
  </tr>
  <tr>
    <td className="border border-gray-300 p-2 text-right font-bold">Net Pay</td>
    <td className="border border-gray-300 p-2 font-bold">₹26,500</td>
  </tr>
          </tbody>
        </table>
      </div>

      {/* Signature Section */}
      {/* <div className="flex justify-between mt-12 text-sm">
        <p>Employer Signature: ______________</p>
        <p>Employee Signature: ______________</p>
      </div> */}
    </div>
  );
};

export default Payslip;
