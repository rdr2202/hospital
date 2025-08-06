import React from 'react';
import { Video, ArrowRight, Calendar, Clock, User, Stethoscope } from 'lucide-react';


const appointments = [
  {
    _id: "66d976c96e0d1aefd9edbd32",
    doctor: "66c979da4c6c095ba4bd552e",
    patient: "66cc5d9be72d55c4045ce62e",
    appointmentDate: new Date("2024-09-26T00:00:00.000Z"),
    timeSlot: "16:00",
    status: "redirected",
    isChronic: true,
  },
  {
    _id: "66d976c96e0d1aefd9edbd33",
    doctor: "66c979da4c6c095ba4bd552f",
    patient: "66cc5d9be72d55c4045ce62f",
    appointmentDate: new Date("2024-09-27T00:00:00.000Z"),
    timeSlot: "10:30",
    status: "scheduled",
    isChronic: false,
  },
  {
    _id: "66d976c96e0d1aefd9edbd34",
    doctor: "66c979da4c6c095ba4bd5530",
    patient: "66cc5d9be72d55c4045ce630",
    appointmentDate: new Date("2024-09-28T00:00:00.000Z"),
    timeSlot: "14:15",
    status: "confirmed",
    isChronic: true,
  },
  {
    _id: "66d976c96e0d1aefd9edbd35",
    doctor: "66c979da4c6c095ba4bd5531",
    patient: "66cc5d9be72d55c4045ce631",
    appointmentDate: new Date("2024-09-29T00:00:00.000Z"),
    timeSlot: "11:45",
    status: "scheduled",
    isChronic: false,
  },
];

const Appointments = () => {
  return (
    <div className="appointments-page">
      <div className="appointments-container">
        <h2 className="dashboard-title">Appointments</h2>
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <div className="appointment-date-time">
                  <Calendar className="icon" />
                  <span className="date">
                    {appointment.appointmentDate.toLocaleDateString()}
                  </span>
                  <Clock className="icon" />
                  <span className="time">{appointment.timeSlot}</span>
                </div>
                <span className={`status ${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="appointment-details">
                <div className="info-item">
                  <Stethoscope className="icon" />
                  <span>Doctor ID: {appointment.doctor}</span>
                </div>
                <div className="info-item">
                  <User className="icon" />
                  <span>Patient ID: {appointment.patient}</span>
                </div>
              </div>
              <div className="appointment-actions">
                <button className="btn video-call">
                  <Video className="icon2" />
                  Video Call
                </button>
                <button className="btn redirect">
                  <ArrowRight className="icon" />
                  Redirect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Appointments;