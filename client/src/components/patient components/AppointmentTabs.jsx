import { Link, useLocation } from "react-router-dom";

const AppointmentTabs = () => {
  const location = useLocation();

  return (
    <div className="flex  justify-center pt-5 pb-4 pl-2 pr-2">
      <ul className="flex flex-wrap text-md font-medium text-center text-gray-500 dark:text-gray-400">
        <li className="me-2">
          <Link
            to="/appointments/newappointment"
            className={`inline-block px-4 py-3 rounded-lg transform transition-transform duration-300 ${
              location.pathname === "/appointments/newappointment"
                ? "text-white bg-blue-500 translate-x-0"
                : "hover:text-gray-900 hover:bg-blue-100 dark:hover:bg-blue-300 dark:hover:text-white"
            }`}
          >
            New Appointment
          </Link>
        </li>
        <li className="me-2 font-md">
          <Link
            to="/appointments/upcoming"
            className={`inline-block px-4 py-3 rounded-lg transform transition-transform duration-300 ${
              location.pathname === "/appointments/upcoming"
                ? "text-white bg-blue-500 translate-x-0"
                : "hover:text-gray-900 hover:bg-blue-100 dark:hover:bg-blue-300 dark:hover:text-white"
            }`}
          >
            Upcoming Appointments
          </Link>
        </li>
        <li className="me-2">
          <Link
            to="/appointments/recent"
            className={`inline-block px-4 py-3 rounded-lg transform transition-transform duration-300 ${
              location.pathname === "/appointments/recent"
                ? "text-white bg-blue-500 translate-x-0"
                : "hover:text-gray-900 hover:bg-blue-100 dark:hover:bg-blue-300 dark:hover:text-white"
            }`}
          >
            Recent Appointments
          </Link>
        </li>
        <li className="me-2">
          <Link
            to="/appointments/cancelled"
            className={`inline-block px-4 py-3 rounded-lg transform transition-transform duration-300 ${
              location.pathname === "/appointments/cancelled"
                ? "text-white bg-blue-500 translate-x-0"
                : "hover:text-gray-900 hover:bg-blue-100 dark:hover:bg-blue-300 dark:hover:text-white"
            }`}
          >
            Cancelled Appointment
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AppointmentTabs;
