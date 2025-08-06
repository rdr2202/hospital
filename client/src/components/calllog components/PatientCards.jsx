// src/components/PatientCards.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { FaUserInjured, FaUserPlus, FaFileMedical } from 'react-icons/fa';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const PatientCards = ({ dashboardData }) => {
  const pieData = {
    labels: ['Chronic Patients', 'Acute Patients'],
    datasets: [
      {
        data: [dashboardData.chronicPatients, dashboardData.acutePatients],
        backgroundColor: ['#4a90e2', '#50c878'],
        hoverBackgroundColor: ['#357ABD', '#3CA454'],
        borderWidth: 0,
        cutout: '60%',
        circumference: 180,
      }
    ]
  };

  const pieOptions = {
    rotation: -90,
    circumference: 180,
    plugins: {
      legend: {
        display: false,
      }
    }
  };

  return (
    <div className="card-container">
      <div className="card small-card">
        <div className='dummy'>
          <div className="card-header">
            <div className="card-icon">
              <FaUserInjured size={24} color="#4a90e2" />
            </div>
            <h2>Total Patients</h2>
            <div className="card-text">
              <p className="card-number">{dashboardData.totalPatients}</p>
              <div className="card-details">
                <p>Chronic: {dashboardData.chronicPatients}</p>
                <p>Acute: {dashboardData.acutePatients}</p>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <Doughnut data={pieData} options={pieOptions} />
              <div className="legend-container">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#4a90e2' }}></div>
                  <span className="legend-text">Chronic</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#50c878' }}></div>
                  <span className="legend-text">Acute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card small-card">
        <div className="card-icon">
          <FaUserPlus size={24} color="#50c878" />
        </div>
        <h2>New Patients Today</h2>
        <p className="card-number">{dashboardData.newPatientsToday}</p>
        <div className="card-details">
          <p>Pending Calls: {dashboardData.pendingCallsFromApp}</p>
        </div>
      </div>
      <div className="card small-card">
        <div className="card-icon">
          <FaFileMedical size={24} color="#f39c12" />
        </div>
        <h2>Pending Records</h2>
        <p className="card-number">{dashboardData.pendingMedicalRecords}</p>
        <div className="card-details">
          <p>Medical Records to Review</p>
        </div>
      </div>
    </div>
  );
};

export default PatientCards;
