import React, { useState, useEffect } from 'react';
import config from '../../config';
const API_URL = config.API_URL;

const NewWorkshop = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [workshop, setWorkshop] = useState({
    title: '',
    sendTo: 'All Patients',
    description: '',
    dateTime: '', // Using a single datetime-local field
    amount: '',
    limit: '',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Set minimum date-time to now
  const [minDateTime, setMinDateTime] = useState('');

  useEffect(() => {
    // Set minimum datetime to current time
    const now = new Date();
    
    // Format to YYYY-MM-DDThh:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setMinDateTime(formattedDateTime);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkshop((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate image file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setValidationErrors(prev => ({
        ...prev,
        image: 'Please select a valid image file (JPEG, PNG, GIF, WEBP)'
      }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        image: 'Image size should be less than 5MB'
      }));
      return;
    }
    
    setWorkshop(prev => ({
      ...prev,
      image: file,
    }));
    setImagePreview(URL.createObjectURL(file));
    
    // Clear validation error
    setValidationErrors(prev => ({
      ...prev,
      image: ''
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Title validation
    if (!workshop.title.trim()) {
      errors.title = 'Workshop title is required';
    } else if (workshop.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    // Description validation
    if (!workshop.description.trim()) {
      errors.description = 'Description is required';
    } else if (workshop.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    // DateTime validation
    if (!workshop.dateTime) {
      errors.dateTime = 'Date and time are required';
    } else {
      const selectedDateTime = new Date(workshop.dateTime);
      const now = new Date();
      if (selectedDateTime <= now) {
        errors.dateTime = 'Date and time must be in the future';
      }
    }
    
    // Amount validation
    if (!workshop.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(workshop.amount) || Number(workshop.amount) < 0) {
      errors.amount = 'Amount must be a positive number';
    }
    
    // Limit validation (optional field)
    if (workshop.limit && (isNaN(workshop.limit) || Number(workshop.limit) <= 0)) {
      errors.limit = 'Participant limit must be a positive number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const { title, sendTo, description, dateTime, amount, limit } = workshop;

      // Convert to UTC date for backend
      const scheduledDateTime = new Date(dateTime).toISOString();

      const payload = {
        title,
        description,
        fee: Number(amount),
        allowedParticipants:
          sendTo === 'All Doctors'
            ? 'Doctors'
            : sendTo === 'All Patients'
            ? 'Patients'
            : 'Everyone',
        scheduledDateTime,
        limit: limit ? Number(limit) : null,
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/workshop/postWorkshop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful submission
        alert('Workshop created successfully!');
        onClose();
      } else {
        // Handle API errors
        alert(data.message || 'Failed to create workshop');
      }
    } catch (error) {
      console.error('Workshop creation error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Workshop</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-red-600 text-2xl p-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          {/* Workshop Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block mb-1 text-gray-700 font-medium">
              Workshop Title*
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={workshop.title}
              onChange={handleInputChange}
              className={`border ${validationErrors.title ? 'border-red-500' : 'border-gray-300'} p-2 w-full rounded`}
              required
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
            )}
          </div>
          
          {/* Send To */}
          <div className="mb-4">
            <label htmlFor="sendTo" className="block mb-1 text-gray-700 font-medium">
              Participants
            </label>
            <select
              id="sendTo"
              name="sendTo"
              value={workshop.sendTo}
              onChange={handleInputChange}
              className="border border-gray-300 p-2 w-full rounded"
            >
              <option value="Everyone">Everyone</option>
              <option value="All Patients">All Patients</option>
              <option value="All Doctors">All Doctors</option>
            </select>
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block mb-1 text-gray-700 font-medium">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={workshop.description}
              onChange={handleInputChange}
              className={`border ${validationErrors.description ? 'border-red-500' : 'border-gray-300'} p-2 w-full rounded`}
              rows="3"
              required
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>
          
          {/* Date and Time (combined) */}
          <div className="mb-4">
            <label htmlFor="dateTime" className="block mb-1 text-gray-700 font-medium">
              Date and Time*
            </label>
            <input
              id="dateTime"
              type="datetime-local"
              name="dateTime"
              value={workshop.dateTime}
              min={minDateTime}
              onChange={handleInputChange}
              className={`border ${validationErrors.dateTime ? 'border-red-500' : 'border-gray-300'} p-2 w-full rounded`}
              required
            />
            {validationErrors.dateTime && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.dateTime}</p>
            )}
          </div>
          
          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block mb-1 text-gray-700 font-medium">
              Fee Amount (in $)*
            </label>
            <input
              id="amount"
              type="number"
              name="amount"
              value={workshop.amount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`border ${validationErrors.amount ? 'border-red-500' : 'border-gray-300'} p-2 w-full rounded`}
              required
            />
            {validationErrors.amount && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
            )}
          </div>
          
          {/* Participant Limit */}
          <div className="mb-4">
            <label htmlFor="limit" className="block mb-1 text-gray-700 font-medium">
              Participant Limit (Optional)
            </label>
            <input
              id="limit"
              type="number"
              name="limit"
              value={workshop.limit}
              onChange={handleInputChange}
              min="1"
              className={`border ${validationErrors.limit ? 'border-red-500' : 'border-gray-300'} p-2 w-full rounded`}
            />
            {validationErrors.limit && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.limit}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">Leave empty for unlimited participants</p>
          </div>
          
          {/* Image Upload */}
          <div className="mb-4">
            <label htmlFor="image" className="block mb-1 text-gray-700 font-medium">
              Workshop Image (Optional)
            </label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className={`border ${validationErrors.image ? 'border-red-500' : 'border-gray-300'} p-2 w-full rounded`}
            />
            {validationErrors.image && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.image}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">Max file size: 5MB (JPEG, PNG, GIF, WEBP)</p>
          </div>
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <p className="block mb-1 text-gray-700 font-medium">Image Preview</p>
              <div className="border border-gray-300 rounded p-2">
                <img src={imagePreview} alt="Workshop preview" className="w-full h-64 object-cover rounded" />
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-6 py-2 rounded-lg focus:outline-none font-medium transition-colors`}
            >
              {loading ? 'Creating Workshop...' : 'Create Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewWorkshop;