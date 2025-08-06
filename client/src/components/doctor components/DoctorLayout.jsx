import React, {useState,useEffect} from "react";
import Sidebar from "./DoctorSidebar";
import Header from "./DoctorHeader";

const Layout = ({ children }) => {
  const [role, setRole] = useState('');
console.log(role);
  useEffect(() => {
    const storedRole = localStorage.getItem('role'); // Retrieve role from localStorage
    setRole(storedRole);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Fixed header at the top */}
      <Header />
      
      <div className="flex">
  {/* Sidebar */}
  <div className="fixed top-0 left-0 w-1/5 bg-indigo-50 h-screen rounded-3xl shadow-2xl border-2">
    <Sidebar role={role} />
  </div>

  {/* Main Content */}
  <div className="flex-1 ml-[20%] mt-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
    {children}
  </div>
</div>

    </div>
  );
};

export default Layout;








