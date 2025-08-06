import React, { useEffect, useRef } from 'react';
import { Chart, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, PieController, LineController } from 'chart.js';
import axios from 'axios';
import 'chartjs-adapter-date-fns';
import 'chartjs-plugin-datalabels';
import config from '../../config';
// Register Chart.js components
Chart.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, PieController, LineController);
const API_URL = config.API_URL;
const ChartComponent = () => {
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let pieChartInstance: Chart<'pie', any[], string> | null = null;
    let lineChartInstance: Chart<'line', number[], string> | null = null;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/dashboard-data`);
        const { chronicCount, acuteCount, totalPatients, pendingMedicalRecords, pendingCallFromApp } = response.data;

        const pieData = {
          labels: ['Chronic', 'Acute'],
          datasets: [{
            data: [chronicCount, acuteCount],
            backgroundColor: ['#FF6384', '#36A2EB']
          }]
        };

        const lineData = {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [{
            label: 'Patient Count',
            data: [10, 20, 30, 40, 50, 60, 70],
            fill: false,
            borderColor: '#742774'
          }]
        };

        // Destroy existing chart instances before creating new ones
        if (pieChartInstance) {
          pieChartInstance.destroy();
        }
        if (lineChartInstance) {
          lineChartInstance.destroy();
        }

        // Create Pie Chart
        if (pieChartRef.current) {
          pieChartInstance = new Chart(pieChartRef.current, {
            type: 'pie',
            data: pieData,
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top'
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw}`
                  }
                }
              }
            }
          });
        }

        // Create Line Chart
        if (lineChartRef.current) {
          lineChartInstance = new Chart(lineChartRef.current, {
            type: 'line',
            data: lineData,
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top'
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw}`
                  }
                }
              }
            }
          });
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();

    // Cleanup function to destroy chart instances on component unmount
    return () => {
      if (pieChartInstance) {
        pieChartInstance.destroy();
      }
      if (lineChartInstance) {
        lineChartInstance.destroy();
      }
    };
  }, []);

  return (
    <div>
      <div>
        <canvas ref={pieChartRef}></canvas>
      </div>
      <div>
        <canvas ref={lineChartRef}></canvas>
      </div>
    </div>
  );
};

export default ChartComponent;
