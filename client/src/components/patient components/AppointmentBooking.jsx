import React from "react";
import { Outlet } from "react-router-dom";
import AppointmentTabs from "./AppointmentTabs";

const AppointmentBooking = () => {
 

  return (
    <div>
    
      {/* <AppointmentTabs/> */}
      <Outlet/>
    </div>
  );
};

export default AppointmentBooking;
