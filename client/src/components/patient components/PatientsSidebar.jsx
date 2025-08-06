import axios from "axios";
import { useEffect, useState } from "react";

const statusColors = {
  Pending: "bg-white text-[#7c4a03]",
  Complete: "bg-white text-[#239b32]",
  Consulting: "bg-white text-[#4546a0]",
  Ongoing: "bg-white text-[#2b6d87]",
};

const PatientsSidebar = ({ onSelect }) => {
  const [appointedPatients, setAppointedPatients] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `http://localhost:5000/api/patient/getAppointedDocs?id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAppointedPatients(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <aside className="w-[260px] bg-white text-white flex flex-col pt-5">
      <input
        className="mx-4 mb-4 rounded-md px-3 py-2 border-2 border-green-500 text-black"
        placeholder="Search patients…"
      />
      <div className="flex-1">
        {appointedPatients.map((doc, i) => {
          const colorClass = statusColors[doc.status] || "bg-white text-black";
          return (
            <div
              key={i}
              onClick={() => onSelect(doc)}
              className={`mb-1 px-4 py-3 rounded-l-xl cursor-pointer ${colorClass}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{doc.name}</span>
                <span
                  className={`ml-2 text-sm px-2 py-0.5 rounded ${colorClass}`}
                >
                  {doc.status}
                </span>
              </div>
              <div className="text-xs">{doc.department}</div>
              <div className="text-[11px] text-gray-700 text-right">Today</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default PatientsSidebar;
