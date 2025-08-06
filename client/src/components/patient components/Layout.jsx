import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Fixed header at the top */}
      <Header />
      
      <div className="flex mt-16"> {/* Add margin to push content below header */}
      <div className="w-1/5 bg-indigo-50 mt-8 ml-8 min-h-screen rounded-3xl shadow-2xl border-2 flex-shrink-0">
        {/* Sidebar width fixed at 64 and spans full screen height */}
        <Sidebar />
        </div>

        {/* Main content takes remaining space */}
        <div className="flex-1 p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;








