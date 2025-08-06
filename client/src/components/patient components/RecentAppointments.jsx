import React, { useState } from 'react'; 

const RecentAppointments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // New filter state for type

  const appointments = [
    { id: 1, patientName: 'Rita', dateTime: '14 Aug 10:00 AM', duration: '1 hr', purpose: 'Diabetes', doctorName: 'Dr.Shilfa', type: 'Follow Up' },
    { id: 2, patientName: 'Rita', dateTime: '1 Aug 11:00 AM', duration: '1 hr', purpose: 'Diabetes', doctorName: 'Dr.Shilfa', type: 'New' },
    { id: 3, patientName: 'Riya', dateTime: '15 July 4:00 PM', duration: '30 mins', purpose: 'Fever', doctorName: 'Dr.Shilfa', type: 'New' },
  ];

  // Filter logic
  const filteredAppointments = appointments.filter(appointment => 
    (appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.dateTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (typeFilter === "" || appointment.type === typeFilter) // Apply the type filter
  );

  // Function to assign background color based on appointment type
  const getTypeBgColor = (type) => {
    return type === "Follow Up" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700";
  };

  return (
    <div className="p-3 bg-white shadow-md rounded-lg">
      <div>
        <p className="font-bold mt-7 mb-7 text-xl pl-2">Previous Appointments</p>
      </div>
      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="sm:w-3/4 md:w-1/2 lg:w-1/4 p-2 border-2 border-gray-400 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Dropdown for filtering by appointment type */}
        <select
          className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Follow Up">Follow Up</option>
          <option value="New">New</option>
        </select>
      </div>

      <div className="relative overflow-x-auto pt-4">
        <table className="w-full text-md text-left rtl:text-right text-white-500 dark:text-gray-100">
          <thead className="text-md text-gray-800 bg-blue-100 dark:bg-blue-200 dark:text-gray-700">
            <tr className="bg-gray-100 text-left">
              <th scope="col" className="px-3 py-3">S.No</th>
              <th scope="col" className="px-3 py-3">Patient Name</th>
              <th scope="col" className="px-3 py-3">Date & Time</th>
              <th scope="col" className="px-3 py-3">Duration</th>
              <th scope="col" className="px-3 py-3">Purpose</th>
              <th scope="col" className="px-3 py-3">Doctor Name</th>
              <th scope="col" className="px-3 py-3">Follow Up / New</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment, index) => (
                <tr key={appointment.id} className="bg-white border-b dark:bg-white-200 dark:border-gray-100">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap dark:text-gray-600">
                    {index + 1}
                  </th>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.patientName}</td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.dateTime}</td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.duration}</td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.purpose}</td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.doctorName}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-semibold ${getTypeBgColor(appointment.type)}`}
                    >
                      {appointment.type}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-600">No matching appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentAppointments;
