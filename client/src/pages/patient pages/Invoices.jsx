import React, { useState } from "react";
import Layout from "../../components/patient components/Layout";
import { useNavigate } from 'react-router-dom';
import { FiDownload } from "react-icons/fi";

const Invoices = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [serviceFilter, setServiceFilter] = useState("All");
    const [methodFilter, setMethodFilter] = useState("All");

    const confirm = () => {
        navigate('/paymentpage');
    };

    const transactions = [
        { id: 1, patientName: "Rita", dateTime: "14 Aug 10:00 AM", paymentId: "id1", service: "Workshop", amount: "Rs.400", method: "GPay", status: "Unpaid", coupons: "no", invoice: "" },
        { id: 2, patientName: "Rita", dateTime: "14 Aug 10:00 AM", paymentId: "id2", service: "Medicine", amount: "Rs.400", method: "GPay", status: "Unpaid", coupons: "no", invoice: "" },
        { id: 3, patientName: "Rita", dateTime: "17 July 11:00 AM", paymentId: "id3", service: "Consultation", amount: "Rs.600", method: "Debit Card", status: "Success", coupons: "no", invoice: "" },
        { id: 4, patientName: "Riya", dateTime: "17 June 6:00 PM", paymentId: "id4", service: "Consultation", amount: "Rs.700", method: "GPay", status: "Success", coupons: "yes", invoice: "" },
    ];

    const getStatusColorClass = (status) => status === "Unpaid" ? "text-red-400" : "text-green-400";
    const getServiceColorClass = (service) => service === "Consultation" ? "text-blue-400" : service === "Medicine" ? "text-green-400" : "text-purple-400";

    const handleFilter = (transactions) => {
        return transactions.filter(transaction => {
            return (statusFilter === "All" || transaction.status === statusFilter) &&
                   (serviceFilter === "All" || transaction.service === serviceFilter) &&
                   (methodFilter === "All" || transaction.method === methodFilter) &&
                   (transaction.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    transaction.dateTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    transaction.paymentId.toLowerCase().includes(searchQuery.toLowerCase()));
        });
    };

    const filteredTransactions = handleFilter(transactions);

    return (
        <div>
            <Layout>
            <div className="p-6 bg-white rounded-lg">
                <p className="font-bold mt-7 mb-7 text-xl px-5">Invoices</p>

                {/* Filters Section */}
                <div className="mb-4 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full lg:w-1/4  p-2 border-2 border-gray-400 rounded-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <select
                        className="w-full lg:w-1/6 p-2 border-2 border-gray-400 rounded-md"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Success">Success</option>
                    </select>

                    <select
                        className="w-full lg:w-1/6 p-2 border-2 border-gray-400 rounded-md"
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                    >
                        <option value="All">All Services</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Workshop">Workshop</option>
                    </select>

                    <select
                        className="w-full lg:w-1/6 p-2 border-2 border-gray-400 rounded-md"
                        value={methodFilter}
                        onChange={(e) => setMethodFilter(e.target.value)}
                    >
                        <option value="All">All Methods</option>
                        <option value="GPay">GPay</option>
                        <option value="Debit Card">Debit Card</option>
                    </select>
                </div>

                {/* Table Section */}
                <div className="relative overflow-x-auto pt-2 pl-3">
                    <table className="w-full text-sm lg:text-md text-left text-gray-500">
                        <thead className="text-md lg:text-md text-gray-600 bg-blue-100">
                            <tr>
                                <th scope="col" className="px-3 py-3">S.No</th>
                                <th scope="col" className="px-3 py-3">Patient Name</th>
                                <th scope="col" className="px-3 py-3">Date & Time</th>
                                <th scope="col" className="px-3 py-3">Payment ID</th>
                                <th scope="col" className="px-3 py-3">Service</th>
                                <th scope="col" className="px-3 py-3">Amount</th>
                                <th scope="col" className="px-3 py-3">Method</th>
                                <th scope="col" className="px-3 py-3">Status</th>
                                <th scope="col" className="px-3 py-3 hidden lg:table-cell">Coupons</th>
                                <th scope="col" className="px-3 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction, index) => (
                                <tr key={transaction.id} className="bg-white border-b dark:bg-white-200 dark:border-gray-100">
                                    <th scope="row" className="px-3 py-4 font-medium text-gray-600">{index + 1}</th>
                                    <td className="px-3 py-4 text-gray-600">{transaction.patientName}</td>
                                    <td className="px-3 py-4 text-gray-600">{transaction.dateTime}</td>
                                    <td className="px-3 py-4 text-gray-600">{transaction.paymentId}</td>
                                    <td className={`px-3 py-4 ${getServiceColorClass(transaction.service)}`}>{transaction.service}</td>
                                    <td className="px-3 py-4 text-gray-600">{transaction.amount}</td>
                                    <td className="px-3 py-4 text-gray-600">{transaction.method}</td>
                                    <td className={`px-3 py-4 ${getStatusColorClass(transaction.status)}`}>{transaction.status}</td>
                                    <td className="px-3 py-4 hidden lg:table-cell text-gray-600">{transaction.coupons}</td>
                                    <td className="px-3 py-4 text-blue-600">
                                        {transaction.status === "Unpaid" ? (
                                            <button
                                                onClick={confirm}
                                                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-5 rounded-md"
                                            >
                                                Pay
                                            </button>
                                        ) : (
                                            <a href="#" className="flex items-center space-x-1">
                                                <FiDownload />
                                                <span>Download</span>
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            )) 
                          ) : (
                            <tr>
                              <td colSpan="10" className="px-6 py-4 text-center text-gray-600">No matching Transactions found</td>
                            </tr>
                          )}
                        </tbody>
                    </table>
                </div>
                </div>
            </Layout>
        </div>
    );
};

export default Invoices;
