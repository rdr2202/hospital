import React, { useState } from 'react';
import doc from '/src/assets/images/doctor images/doc.jpg';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";

const doctors = [
  { name: 'Dr. Clive Nathan', specialty: 'BHMS', experience: '8 Years Experience', rating: 5 },
  { name: 'Dr. Laura Jaden', specialty: 'BHMS, MD - Homeopathy', experience: '9 Years Experience', rating: 5 },
  { name: 'Dr. Aliko Maria', specialty: 'BHMS', experience: '6 Years Experience', rating: 5 },
  { name: 'Dr. Amelia Kim', specialty: 'LCEH, MD - Homeopathy', experience: '7 Years Experience', rating: 4 },
  // Add more doctor objects
];

const Docprofile = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DoctorLayout>
         <div className="bg-blue-50">
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          className="border rounded p-2 w-full max-w-xs"
          placeholder="Search by Doctor's Name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
       
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-4 text-center">
            <img
              src={doc} // Replace with doctor's image
              alt={doctor.name}
              className="w-24 h-24 mx-auto rounded-full mb-4"
            />
            <h3 className="text-xl font-bold">{doctor.name}</h3>
            <p>{doctor.specialty}</p>
            <p>{doctor.experience}</p>
            <div className="flex justify-center mt-2">
              {Array.from({ length: doctor.rating }).map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
              {doctor.rating < 5 && Array.from({ length: 5 - doctor.rating }).map((_, i) => (
                <span key={i} className="text-gray-400">★</span>
              ))}
           </div>
           </div>
        ))}
      </div>
    </div>
    </div>
    </DoctorLayout>
    
  );
};

export default Docprofile;
