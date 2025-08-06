import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css"; // Import the CSS for the calendar
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";

// Set up the moment localizer (necessary for dates and times)
const localizer = momentLocalizer(moment);

// Example events data (you can replace with your actual events data)
const events = [
  {
    title: 'Doctor Appointment',
    start: new Date(),
    end: new Date(),
    allDay: true,
  },
  {
    title: 'Workshop',
    start: new Date(2024, 8, 17),
    end: new Date(2024, 8, 17),
  },
];

const DocAppointments = () => {
  return (
    <DoctorLayout>
      <div className="p-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Appointments</h1>
        
        {/* Big Calendar with white background */}
        <div style={{ height: "80vh", backgroundColor: "white" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%", backgroundColor: "white" }} // White background
          />
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DocAppointments;
