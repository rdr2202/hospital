import React, { useEffect, useState } from "react";
import axios from "axios";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { PlusIcon } from '@heroicons/react/20/solid';
import NewWorkshop from './NewWorkshop'; // Modal component
import config from '../../config';
const API_URL = config.API_URL;

// WorkshopCard component
const WorkshopCard = ({ title, description, scheduledDateTime, fee, image }) => {
  const dateObj = new Date(scheduledDateTime);
  const formattedDate = dateObj.toLocaleDateString();
  const formattedTime = dateObj.toLocaleTimeString();

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-sm border-2 border-blue-50">
      <img className="rounded-lg mb-4" src={image || '/src/assets/images/doctor images/workshop.jpg'} alt={`${title} Workshop`} />
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="text-sm text-gray-500">
        <p>{formattedTime} | {formattedDate}</p>
        <p className="font-semibold">Fee: ₹{fee}</p>
      </div>
    </div>
  );
};

const WorkshopPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
  const [filter, setFilter] = useState('All'); // State to handle filter selection
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    const fetchWorkshops = async () => {
      const token = localStorage.getItem('token');
      console.log("Token: ", token);
      try {
        const response = await axios.get(`${API_URL}/api/workshop/viewAll`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWorkshops(response.data.workshops);
      } catch (error) {
        console.error('Error fetching workshops:', error);
      }
    };

    fetchWorkshops();
  }, []);

  // Function to determine the status of the workshop
  const getStatus = (scheduledDateTime) => {
    const today = new Date();
    const workshopDate = new Date(scheduledDateTime);
    return workshopDate >= today ? 'Upcoming' : 'Expired';
  };

  // Filter workshops based on the selected filter
  const filteredWorkshops = workshops.filter(workshop => 
    filter === 'All' || getStatus(workshop.scheduledDateTime) === filter
  );

  return (
    <DoctorLayout>
      <div className="min-h-screen p-7">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Workshops</h1>
          <button
            onClick={() => setIsModalOpen(true)} // Open the modal when clicked
            className="bg-blue-400 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Workshop</span>
          </button>
        </div>

        {/* Dropdown Filter */}
        <div className="mb-6">
          <label htmlFor="filter" className="block text-md font-medium text-gray-700 mb-2">
            Filter Workshops
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-40 p-2 border border-gray-300 rounded"
          >
            <option value="All">All Workshops</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.length > 0 ? (
            filteredWorkshops.map((workshop, index) => (
              <WorkshopCard key={index} {...workshop} />
            ))
          ) : (
            <p>No workshops available for the selected filter.</p>
          )}
        </div>

        {/* Modal Popup */}
        {isModalOpen && (
          <NewWorkshop 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </DoctorLayout>
  );
};

export default WorkshopPage;
