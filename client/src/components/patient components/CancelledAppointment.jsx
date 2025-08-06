import React from "react";
import { useNavigate } from "react-router-dom";
import doctor from '/src/assets/images/patient images/doctor.jpeg';
import { FaClock } from "react-icons/fa6";
import { IoVideocam } from "react-icons/io5";

const CancelledAppointment = () => {
    const navigate = useNavigate();
    const handleButtonClick = () =>{
        navigate('/appointments/newappointment');
    };
    const appointments = [
        {
          id: '#Apt0004',
          name: 'Anderea',
          date: '05 Nov 2024',
          time: '11:00 AM',
          callType: 'Video Call',
          image: doctor,
        },
        {
          id: '#Apt0005',
          name: 'Robert',
          date: '07 Nov 2024',
          time: '11:00 AM',
          callType: 'Video Call',
          image: doctor,
        },
      ];
    return (
        <div className="p-5">
      <p className="font-bold mb-5 text-xl text-left">Cancelled Appointments</p>
      {appointments.map((appointment, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-md mb-5 flex items-center justify-between max-w-4xl mx-auto">
          {/* Image */}
          <div className="flex items-center space-x-4">
            <img className="w-10 h-10 rounded-full object-cover" src={appointment.image} alt={appointment.name} />
            <div>
              <p className="text-sm text-blue-500 font-semibold">{appointment.id}</p>
              <p className="text-lg font-bold">{appointment.name}</p>
            </div>
          </div>

          {/* Date and Time */}
          <div className=" flex text-center space-x-2">
            <div className="text-gray-700 pt-1"><FaClock/> </div>
            <p className="font-semibold text-gray-500">{appointment.date} {appointment.time}</p>
          </div>

          {/* Call Type */}
          <div className="flex text-center space-x-2">
          <div className="text-blue-600 pt-1"><IoVideocam/> </div>
            <p className="font-semibold text-gray-500">{appointment.callType}</p>
          </div>


                <div className="text-blue-400 hover:text-blue-600 flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-2 mt-1 sm:px-0">
                    <button
                    onClick={handleButtonClick}
                    >
                    Book Again
                    </button>
                </div>

            </div>
        ))}
        </div>
    )
}

export default CancelledAppointment;