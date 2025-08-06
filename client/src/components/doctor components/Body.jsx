// src/components/Body.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Appointments from '../pages/Appointments';
import Patients from '../pages/Patients';
import AssistDoc from '../pages/AssistDoc';
import WorkshopPage from '../pages/WorkshopPage';
import Inventry from '../pages/Inventry';
import Payments from '../pages/Payments';
import Medicine from '../pages/Medicine';
import Content from '../pages/Content';

const Body = () => {
  return (
    <div className="flex-grow p-6">
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/assistdoc" element={<AssistDoc />} />
        <Route path="/content" element={<Content />} />
        <Route path="/inventry" element={<Inventry />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/medicine" element={<Medicine />} />
        <Route path="/content" element={<Content />} />
        <Route path="/workshoppage" element={<WorkshopPage/>} />

        
        {/* Add more routes as needed */}
      </Routes>
    </div>
  );
};

export default Body;
