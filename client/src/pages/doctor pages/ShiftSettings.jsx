import React, { useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt } from "react-icons/fa";
import { format, parseISO, isWithinInterval } from "date-fns";

const shifts = ["Morning", "Evening", "Night"];
const shiftColors = {
  Morning: {
    background: "bg-green-500",
    text: "text-green-900"
  },
  Evening: {
    background: "bg-yellow-500", 
    text: "text-yellow-900"
  },
  Night: {
    background: "bg-blue-500",
    text: "text-blue-900"
  }
};

const initialRoster = [
  { 
    id: 1, 
    name: "Dr. John Doe", 
    currentShift: "Night", 
    nextShift: "", 
    currentFrom: new Date().toISOString().split('T')[0],
    currentTo: "", 
    nextFrom: "", 
    nextTo: "",
    previousShifts: [] 
  },
  { 
    id: 2, 
    name: "Dr. Jane Smith", 
    currentShift: "Evening", 
    nextShift: "", 
    currentFrom: new Date().toISOString().split('T')[0],
    currentTo: "", 
    nextFrom: "", 
    nextTo: "",
    previousShifts: [] 
  },
  { 
    id: 3, 
    name: "Dr. Mahisha", 
    currentShift: "Morning", 
    nextShift: "", 
    currentFrom: new Date().toISOString().split('T')[0],
    currentTo: "", 
    nextFrom: "", 
    nextTo: "",
    previousShifts: [] 
  },
];

export default function Roster() {
  const [roster, setRoster] = useState(initialRoster);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [bulkAssign, setBulkAssign] = useState({ 
    shift: "", 
    from: "", 
    to: "" 
  });
  const [showCalendarId, setShowCalendarId] = useState(null);

  const handleNextShiftAssign = (id, nextShiftDetails) => {
    setRoster((prev) =>
      prev.map((doctor) => {
        if (doctor.id === id) {
          return {
            ...doctor,
            nextShift: nextShiftDetails.shift,
            nextFrom: nextShiftDetails.from,
            nextTo: nextShiftDetails.to,
            // When next shift starts, current shift moves to previous shifts
            previousShifts: nextShiftDetails.from 
              ? [
                  ...doctor.previousShifts,
                  { 
                    shift: doctor.currentShift, 
                    from: doctor.currentFrom, 
                    to: nextShiftDetails.from 
                  }
                ]
              : doctor.previousShifts
          };
        }
        return doctor;
      })
    );
  };

  const handleBulkAssign = () => {
    // Validate bulk assignment
    if (!bulkAssign.shift || !bulkAssign.from || !bulkAssign.to) {
      alert("Please fill in all bulk assignment fields");
      return;
    }

    setRoster((prev) =>
      prev.map((doctor) => {
        // Only update selected doctors
        if (selectedDoctors.includes(doctor.id)) {
          return {
            ...doctor,
            nextShift: bulkAssign.shift,
            nextFrom: bulkAssign.from,
            nextTo: bulkAssign.to,
            // When next shift starts, current shift moves to previous shifts
            previousShifts: bulkAssign.from 
              ? [
                  ...doctor.previousShifts,
                  { 
                    shift: doctor.currentShift, 
                    from: doctor.currentFrom, 
                    to: bulkAssign.from 
                  }
                ]
              : doctor.previousShifts
          };
        }
        return doctor;
      })
    );

    // Reset selection and bulk assign fields
    setSelectedDoctors([]);
    setBulkAssign({ shift: "", from: "", to: "" });
  };

  const toggleDoctorSelection = (id) => {
    setSelectedDoctors((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const getShiftDetailsForDate = (date) => {
    const shiftsOnDate = roster.reduce((acc, doctor) => {
      const matchingShifts = doctor.previousShifts.filter(shift => 
        shift.from && shift.to && 
        isWithinInterval(date, {
          start: parseISO(shift.from),
          end: parseISO(shift.to)
        })
      );

      if (matchingShifts.length > 0) {
        acc.push(...matchingShifts.map(shift => ({
          ...shift,
          doctorName: doctor.name
        })));
      }

      return acc;
    }, []);

    return shiftsOnDate;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Doctor Roster</h2>

      {/* Bulk Assign */}
      <div className="flex gap-2 justify-end mb-4">
        <select
          className="border p-2"
          value={bulkAssign.shift}
          onChange={(e) => setBulkAssign({ ...bulkAssign, shift: e.target.value })}
        >
          <option value="">Select Shift</option>
          {shifts.map((shift) => (
            <option key={shift} value={shift}>
              {shift}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border p-2"
          value={bulkAssign.from}
          onChange={(e) => setBulkAssign({ ...bulkAssign, from: e.target.value })}
        />
        <input
          type="date"
          className="border p-2"
          value={bulkAssign.to}
          onChange={(e) => setBulkAssign({ ...bulkAssign, to: e.target.value })}
        />
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded" 
          onClick={handleBulkAssign}
          disabled={selectedDoctors.length === 0}
        >
          Assign Next Shift
        </button>
      </div>

      {/* Roster Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">
              <input 
                type="checkbox" 
                onChange={(e) => 
                  setSelectedDoctors(e.target.checked ? roster.map(d => d.id) : [])
                } 
                checked={selectedDoctors.length === roster.length}
              />
            </th>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Current Shift</th>
            <th className="p-2">Next Shift</th>
            <th className="p-2">Next From</th>
            <th className="p-2">Next To</th>
            <th className="p-2">Shifts</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((doctor) => (
            <tr key={doctor.id} className="border">
              <td className="p-2">
                <input 
                  type="checkbox" 
                  checked={selectedDoctors.includes(doctor.id)} 
                  onChange={() => toggleDoctorSelection(doctor.id)} 
                />
              </td>
              <td className="p-2">{doctor.id}</td>
              <td className="p-2">{doctor.name}</td>
              <td className="p-2">
                {/* Current shift is now read-only */}
                {doctor.currentShift}
              </td>
              <td className="p-2">
                <select
                  className="border p-1"
                  value={doctor.nextShift}
                  onChange={(e) => handleNextShiftAssign(doctor.id, {
                    shift: e.target.value,
                    from: doctor.nextFrom,
                    to: doctor.nextTo
                  })}
                >
                  <option value="">Select Next Shift</option>
                  {shifts.map((shift) => (
                    <option key={shift} value={shift}>
                      {shift}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-2">
                <input
                  type="date"
                  className="border p-1"
                  value={doctor.nextFrom}
                  onChange={(e) => handleNextShiftAssign(doctor.id, {
                    shift: doctor.nextShift,
                    from: e.target.value,
                    to: doctor.nextTo
                  })}
                />
              </td>
              <td className="p-2">
                <input
                  type="date"
                  className="border p-1"
                  value={doctor.nextTo}
                  onChange={(e) => handleNextShiftAssign(doctor.id, {
                    shift: doctor.nextShift,
                    from: doctor.nextFrom,
                    to: e.target.value
                  })}
                />
              </td>
              <td className="p-2 relative">
                <button 
                  onClick={() => setShowCalendarId(doctor.id === showCalendarId ? null : doctor.id)} 
                  className="text-blue-500"
                >
                  <FaCalendarAlt size={20} />
                </button>

                {/* Popover Calendar */}
                {showCalendarId === doctor.id && (
                  <div className="absolute bg-white border shadow-lg p-2 rounded z-10 mt-2 w-96">
                    <Calendar
                      tileContent={({ date, view }) => {
                        if (view === 'month') {
                          const shiftsOnDate = getShiftDetailsForDate(date);
                          
                          if (shiftsOnDate.length > 0) {
                            // If multiple shifts, show the last shift
                            const lastShift = shiftsOnDate[shiftsOnDate.length - 1];
                            return (
                              <div 
                                className={`absolute bottom-0 left-0 right-0 h-1 ${shiftColors[lastShift.shift].background}`}
                                title={`${lastShift.doctorName} - ${lastShift.shift} Shift`}
                              />
                            );
                          }
                        }
                        return null;
                      }}
                      tileClassName={({ date, view }) => {
                        if (view === 'month') {
                          const shiftsOnDate = getShiftDetailsForDate(date);
                          
                          if (shiftsOnDate.length > 0) {
                            // If multiple shifts, show the last shift
                            const lastShift = shiftsOnDate[shiftsOnDate.length - 1];
                            return `relative ${shiftColors[lastShift.shift].text}`;
                          }
                        }
                        return null;
                      }}
                    />
                    <button
                      onClick={() => setShowCalendarId(null)}
                      className="mt-2 bg-red-500 text-white px-2 py-1 rounded w-full"
                    >
                      Close
                    </button>
                  </div>
                )}
              </td>
              <td className="p-2">
                <button 
                  className="bg-green-500 text-white px-3 py-1 rounded" 
                  onClick={() => {
                    // When confirmed, move next shift to current shift
                    setRoster((prev) => 
                      prev.map((doctor) => 
                        doctor.id === doctor.id 
                          ? {
                              ...doctor,
                              currentShift: doctor.nextShift,
                              currentFrom: doctor.nextFrom,
                              currentTo: doctor.nextTo,
                              nextShift: "",
                              nextFrom: "",
                              nextTo: ""
                            }
                          : doctor
                      )
                    );
                  }}
                  disabled={!doctor.nextShift || !doctor.nextFrom || !doctor.nextTo}
                >
                  Confirm Shift
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Previous Shifts Display */}
    </div>
  );
}