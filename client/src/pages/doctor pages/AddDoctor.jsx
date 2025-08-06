import React, { useState } from 'react';
// import '../css/AddDoctor.css';

const AddDoctor = () => {
  const [doctor, setDoctor] = useState({
    name: '',
    phoneNumber: '',
    role: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor({ ...doctor, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!doctor.name || !doctor.phoneNumber || !doctor.role) {
      setError('Please fill in all fields');
    } else {
      console.log(doctor);
      setDoctor({
        name: '',
        phoneNumber: '',
        role: ''
      });
      setError('');
    }
  };

  return (
    <div className="doctor-form-container">
      <form onSubmit={handleSubmit} className="doctor-form">
        <div className="form-header">
          <div className="doctor-icon-placeholder">          
            <i className="fas fa-user-md icon" style={{color: "#7C3AED", fontSize: "48px"}}></i>
          </div>
          <h2>Add Doctor</h2>
        </div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={doctor.name}
          onChange={handleChange}
          required
          style={{backgroundColor: "#ecebeb", border: "1px solid #7C3AED"}}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={doctor.phoneNumber}
          onChange={handleChange}
          required
          style={{backgroundColor: "#ecebeb", border: "1px solid #7C3AED"}}
        />
        <select
          name="role"
          value={doctor.role}
          onChange={handleChange}
          required
          style={{backgroundColor: "#ecebeb", border: "1px solid #7C3AED"}}
          >
          <option value="">Select Role</option>
          <option value="Assistant Doctor">Assistant Doctor</option>
          <option value="Main Doctor">Main Doctor</option>
        </select>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="add-button">Add Doctor</button>
      </form>
    </div>
  );
};

export default AddDoctor;