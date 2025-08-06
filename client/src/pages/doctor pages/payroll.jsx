import React, { useEffect,useState } from "react";
import axios from "axios";

const PayrollManagement = () => {
  const [activeTab, setActiveTab] = useState("payroll");
  const [formData, setFormData] = useState({
    employeeID: "",
    name: "",
    baseSalary: "",
    totalAllowances: "",
    totalDeductions: "",
    paymentMode: "Bank Transfer",
    paymentDate: "",
    allowances: [],
    deductions:[],
    bonus: "",
   
  });
 
  const [historyData, setHistoryData] = useState([]);
  useEffect(() => {
    fetchHistory();
  }, []);

  const [errorMessage, setErrorMessage] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState(null);
   // Handle tab switching
   const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
  };
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };
  // Handle input changes for history form
  const handleHistoryChange = (e) => {
    const { name, value } = e.target;
    setHistoryForm((prevState) => ({ ...prevState, [name]: value }));
  };
 
 

  // Fetch employee details by Employee ID
  const fetchEmployeeDetails = async () => {
    if (!formData.employeeID) {
      setErrorMessage("Please enter a valid Employee ID.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/api/payslip/employee/${formData.employeeID}`
      );
      const employee = response.data;

      setFormData((prevState) => ({
        ...prevState,
        baseSalary: employee.baseSalary || "",
        totalAllowances: employee.totalAllowances || "",
        totalDeductions: employee.totalDeductions || "",
        name:employee.name ||"",
       
      }));

      // Set allowances and deductions
      setAllowances(employee.allowances || []);
      setDeductions(employee.deductions || []);
      setErrorMessage("");
      setIsFetched(true);
    } catch (error) {
      setErrorMessage("Employee not found.");
      setIsFetched(false);
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.bonus || !formData.paymentDate) {
      setErrorMessage("name, Bonus, and Payment Date are required.");
      return;
    }
    try {
      const dataToSubmit = {
        ...formData,
        allowances: allowances.length ? allowances : formData.allowances, // Ensure allowances are included       
        deductions: deductions.length ? deductions : formData.deductions, // Ensure deductions are included
      };
      
      await axios.post("http://localhost:5000/api/payslip/payroll",dataToSubmit);
      alert("Payroll record added successfully.");
      // Automatically generate payslip after submission
      const response = await axios.get(
        `http://localhost:5000/api/payslip/generate/${formData.employeeID}`,
        { responseType: "blob" } // Fetch the payslip as a Blob for download
      );

      // Create download link for payslip
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      window.open(url, "_blank");

      // Set payslip data for display (if needed)
      // setPaySlipData(await response.data.text());

      // Reset form
      setFormData({
        employeeID: "",
        name: "",
        baseSalary: "",
        totalAllowances: "",
        totalDeductions: "",
        paymentMode: "Bank Transfer",
        paymentDate: "",
        allowances: [],
        deductions: [],
        bonus: "",
      });
      setIsFetched(false);
    } catch (error) {
      alert("Error adding payroll record.");
    }
  };
  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/payslip/history");
      console.log(response.data);
      if (response.status === 200) {
        setHistoryData(response.data);
      } else {
        setErrorMessage("Failed to fetch payment history.");
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setErrorMessage("Error fetching data. Please try again.");
    }
  };



  return (
    <div>
    
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => handleTabSwitch("payroll")}
          className={`px-4 py-2 ${
            activeTab === "payroll" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded-md`}
        >
          Payroll
        </button>
        <button
          onClick={() => handleTabSwitch("history")}
          className={`px-4 py-2 ${
            activeTab === "history" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded-md`}
        >
          History
        </button>
      </div>

      {/* Payroll Tab */}
      {activeTab === "payroll" && (
        <form onSubmit={handleSubmit}>
          {/* Employee ID and Fetch Button */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-bold mb-2">Employee ID</label>
              <input
                type="text"
                name="employeeID"
                value={formData.employeeID}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
                      {/* Employee Name */}
         
        </div>


        {/* Fetch Employee Details Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={fetchEmployeeDetails}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Fetch Details
          </button>
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        </div>

        {isFetched && (
          <>
           <div className="flex-1">
            <label className="block text-gray-700 font-bold mb-2">Employee Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              readOnly
            />
          </div>
            {/* Base Salary */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Base Salary</label>
              <input
                type="number"
                name="baseSalary"
                value={formData.baseSalary}
                className="w-full px-3 py-2 border rounded-md"
                readOnly
              />
            </div>



                {/* Allowances */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Allowances</label>
            {allowances.map((allowance, index) => (
              <div key={index} className="mb-2">
                <label className="block text-gray-700">{allowance.name}</label>
                <input
                  type="number"
                  value={allowance.value}
                  className="w-full px-3 py-2 border rounded-md"
                  readOnly
                />
              </div>
            ))}
          </div>

          {/* Deductions */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Deductions</label>
            {deductions.map((deduction, index) => (
              <div key={index} className="mb-2">
                <label className="block text-gray-700">{deduction.name}</label>
                <input
                  type="number"
                  value={deduction.value}
                  className="w-full px-3 py-2 border rounded-md"
                  readOnly
                />
              </div>
            ))}
          </div>

          {/* Bonus */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Bonus</label>
            <input
              type="number"
              name="bonus"
              value={formData.bonus}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Payment Mode and Date */}
          <div className="mb-4 flex flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-bold mb-2">Payment Mode</label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-bold mb-2">Payment Date</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md"
              >
                Submit Payroll
              </button>
                 {/* {payslipData && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Generated Payslip</h3>
     
          <Payslip payslipData={payslipData} />
        </div>
             )} */}
             {/* {downloadUrl && (
        <div className="mt-4">
          <a
            href={downloadUrl}
            download={Payslip_`${formData.employeeID}`.pdf}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Download Payslip
          </a>
     </div>
             )} */}

            </>
          )}
        </form>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
  <div className="overflow-x-auto">
    <div className="inline-block min-w-full py-2 align-middle">
      <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
       
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        {historyData.length > 0 ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="  px-4 py-2">Employee Id</th>
                <th className=" px-4 py-2">Name</th>
                <th className="  px-4 py-2">Net Pay</th>
                <th className=" px-4 py-2">Payment Date</th>
                 <th className=" px-4 py-2">ACTIONS</th> 
              </tr>
            </thead>
            <tbody>
              {historyData.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className=" px-4 py-4">{item.employeeID}</td>
                  <td className=" px-4 py-4">{item.name}</td>
                  <td className=" px-4 py-4">₹{item.netPay}</td>
                  <td className=" px-4 py-4">
                    {new Date(item.paymentDate).toISOString().split('T')[0]}
                  </td>
                  <td className="px-4 py-4">
        {/* Link to download the PDF */}
        <a
          href={`http://localhost:5000${item.pdfUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Download
        </a>
      </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Payment History not available.</p>
        )}
      </div>
    </div>
  </div>
)}
</div>
  );
};

export default PayrollManagement;
