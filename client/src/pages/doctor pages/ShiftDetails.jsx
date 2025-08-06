import React, { useState, useEffect } from "react";
import axios from "axios";

function ShiftDetails() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State to track whether shifts are being edited
  const [editMode, setEditMode] = useState({});

  // Fetch shifts from the database when the component mounts
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/shift/getshift", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setShifts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching shifts:", error);
        alert("Failed to fetch shift details");
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  // Handle time change
  const handleTimeChange = (index, field, value) => {
    const updatedShifts = [...shifts];
    updatedShifts[index][field] = value;
    setShifts(updatedShifts);
  };

  // Save shifts to the database
  const saveShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/shift/saveshift",
        { shifts },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message || "Shifts saved successfully!");
      // After saving, disable editing mode
      setEditMode({});
    } catch (error) {
      console.error("Error saving shifts:", error);
      alert("Failed to save shifts");
    }
  };

  // Toggle edit mode for a specific shift
  const toggleEditMode = (index) => {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [index]: !prevEditMode[index], // Toggle edit mode for the selected shift
    }));
  };

  // Show loading indicator while fetching data
  if (loading) {
    return <p>Loading shift details...</p>;
  }

  return (
    <div>
      <ul className="space-y-4">
        {shifts.map((shift, index) => (
          <li
            key={index}
            className="p-4 bg-white rounded-lg shadow flex flex-col sm:flex-row justify-between items-center"
          >
            <div>
              <p className="font-bold text-gray-700">{shift.name} Shift</p>
            </div>
            <div className="flex space-x-4 items-center mt-2 sm:mt-0">
              <div>
                <label className="text-sm text-gray-600">Start Time </label>
                <input
                  type="time"
                  value={shift.startTime}
                  onChange={(e) =>
                    handleTimeChange(index, "startTime", e.target.value)
                  }
                  className="border rounded-lg px-2 py-1"
                  disabled={!editMode[index]} // Disable input if not in edit mode
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">End Time </label>
                <input
                  type="time"
                  value={shift.endTime}
                  onChange={(e) =>
                    handleTimeChange(index, "endTime", e.target.value)
                  }
                  className="border rounded-lg px-2 py-1"
                  disabled={!editMode[index]} // Disable input if not in edit mode
                />
              </div>
              {/* Edit button to toggle editing */}
              <button
                onClick={() => toggleEditMode(index)}
                className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                {editMode[index] ? "Done" : "Edit"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-end">
        <button
          onClick={saveShifts}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save Shifts
        </button>
      </div>
    </div>
  );
}

export default ShiftDetails;
