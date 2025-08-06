import React, { useState } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Phone } from 'lucide-react';

const Form= () => {
  const feetOptions = [...Array(10).keys()].map(i => ({ value: i+1, label: `${i+1} feet `}));
  const inchesOptions = [...Array(10).keys()].map(i => ({ value: i, label: `${i} inches `}));
   const weightOptions = [...Array(151).keys()].slice(1).map(i => ({ value: i, label: `${i} kg `}));
   const [isSubmitting, setIsSubmitting] = useState(false);

  const country = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
    "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", 
    "Congo, Republic of the", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", 
    "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
    "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", 
    "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", 
    "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", 
    "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", 
    "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", 
    "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

  const countryOptions = country.map(reason => ({
    value: reason,
    label: reason,
  }));
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
];

const stateOptions = states.map(state => ({
    value: state,
    label: state,
}));

const cities = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Tiruppur", "Vellore", "Thoothukudi", 
  "Nagercoil", "Thanjavur", "Dindigul", "Cuddalore", "Kanchipuram", "Kumarapalayam", "Hosur", "Karaikudi", "Neyveli", "Sivakasi", 
  "Udhagamandalam (Ooty)", "Rajapalayam", "Pollachi", "Ambur", "Nagapattinam", "Pudukkottai", "Arakkonam", "Ariyalur", 
  "Tiruvannamalai", "Kovilpatti", "Pattukkottai", "Ramanathapuram", "Vaniyambadi", "Perambalur", "Sivaganga", "Viluppuram", 
  "Theni", "Namakkal", "Karur", "Udhampur", "Dharmapuri", "Krishnagiri", "Tiruchengode"
];

const cityOptions = cities.map(city => ({
  value: city,
  label: city,
}));

  const disease = [
    "Accidents", "Acute Back Pain", "Acute Bronchitis", "Acute Contact Dermatitis", "Acute migraine / headache", "Acute Eczema Flare-ups", "Acute Kidney Injury",
    "Acute viral fever", "Acute Pelvic Inflammatory Disease", "Acute Sinusitis", "Acute Urticaria", "Alzheimer's Disease", "Allergic cough", "Allergic skin rashes",
    "Ankylosing Spondylitis", "Asthma", "Atrial Fibrillation", "Bipolar Disorder", "Boils, abscess", "Breast Cancer", "Chronic Bronchitis", "Chronic Hepatitis (B and C)",
    "Chronic Kidney Disease", "Chronic Migraine", "Chronic Obstructive Pulmonary Disease", "Colorectal Cancer", "Common Cold", "Coronary Artery Disease", "COVID-19",
    "Crohn's Disease", "Croup", "Dengue Fever", "Diabetes (Type 1 and Type 2)", "Diabetic Nephropathy", "Epilepsy", "Fibromyalgia", "Gastroenteritis",
    "Generalized Anxiety Disorder", "Glomerulonephritis", "Heart Failure", "Head injury", "Hypertension (High Blood Pressure)", "Hyperthyroidism", "Hypothyroidism",
    "Injury, cuts, burns, bruise, blow", "Impetigo", "Influenza (Flu)", "Irritable Bowel Syndrome (IBS)", "Leukemia", "Lung Cancer", "Major Depressive Disorder", "Malaria", "Metabolic Syndrome",
    "Multiple Sclerosis", "Nephrolithiasis (Kidney Stones)", "Non-Alcoholic Fatty Liver Disease", "Osteoarthritis", "Osteoporosis",
    "Oral Ulcers", "Parkinson's Disease", "Peripheral Artery Disease", "Polycystic Kidney Disease", "Polycystic Ovary Syndrome (PCOS)",
    "Post-Traumatic Stress Disorder (PTSD)", "Prostate Cancer", "Psoriasis", "Pulmonary Hypertension", "Rheumatoid Arthritis", "Schizophrenia",
    "Scleroderma", "Sjögren's Syndrome", "Sprains and Strains", "Strep Throat", "Systemic Lupus Erythematosus (SLE)", "Tooth Pain", "Trauma", "Ulcerative Colitis", "Urinary Tract Infection (UTI)", "Other"
  ];

  const diseaseOptions = disease.map(reason => ({
    value: reason,
    label: reason,
  }));

  const associatedDisease = ["Diabetes", "Thyroid", "Hypertension (Blood Pressure)", "Asthma/Lung Disease", "Skin Disease", "Depression", "PCOD", "None", "Other"];
  const associatedDiseaseOption = associatedDisease.map(reason => ({
    value: reason,
    label: reason,
  }));

  const historyDiseases = ["PCOD", "Thyroid", "Hypertension (Blood Pressure)", "Diabetes Mellitis (Type 2)", "Obesity", "Cancer", "Other"];
  const historyDiseasesOption = historyDiseases.map(reason => ({
    value: reason,
    label: reason,
  }));
  const customStyles={indicatorSeparator: () => ({
    display: 'none'
})}

  const bodyTypeOptions = [
    { value: 'lean thin', label: ' Lean-Thin'},
    { value: 'moderate', label: 'Moderate' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'obese', label: 'Obese' },
    
  ];

  const options = ["Friends/Family",   "Instagram", "Facebook", "Google","Self","Other"];

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    occupation: '',
    country: '',
    state: '',
    city: '',
    disease: '',
    symptom:'',
    associatedDisease: '',
    medicineConsuming: '',
    diseaseHistory: '',
    surgeryHistory: '',
    familyHistory: '',
    allergies: '',
    bodyType: null,
    clinicSource: [],
  });

  const [errors, setErrors] = useState({});
  const [showSymptomField, setShowSymptomField] = useState(false);
  const navigate = useNavigate();
 

  

  const validate = () => {
    const newErrors = {};
    if (!formData.feet) newErrors.feet = 'Height in feet is required';
    if (!formData.inches) newErrors.inches = 'Height in inches is required';
    if (!formData.weight) newErrors.weight = 'Weight is required';
    if (!formData.occupation) newErrors.occupation = 'Occupation is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.disease) newErrors.disease = 'Disease is required';
    if (formData.disease?.value === 'Other' && !formData.symptom) newErrors.symptom = 'Symptom is required';
    if (!formData.associatedDisease) newErrors.associatedDisease = 'Associated disease is required';
    if (!formData.medicineConsuming) newErrors.medicineConsuming = 'Medicine consuming is required';
    if (!formData.diseaseHistory) newErrors.diseaseHistory = 'Disease history is required';
    if (!formData.surgeryHistory) newErrors.surgeryHistory = 'Surgery history is required';
    if (!formData.familyHistory) newErrors.familyHistory = 'Family history is required';
    if (!formData.allergies) newErrors.allergies = 'Allergies are required';
    if (!formData.bodyType) newErrors.bodyType = 'BodyType  is required';
    if (formData.clinicSource.length === 0) newErrors.clinicSource = 'At least one source is required';
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData(prevState => {
      const newFormData = { ...prevState, [field]: value };
      if (field === 'disease') {
        setShowSymptomField(value?.value === 'Other');
      }
      setErrors(prevErrors => {
        const { [field]: _, ...remainingErrors } = prevErrors;
        return remainingErrors;
      });
      return newFormData;
    });
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setFormData(prev => {
      const newClinicSource = checked
        ? [...prev.clinicSource, value]
        : prev.clinicSource.filter(option => option !== value);
      // Clear error for clinicSource if any checkbox is selected
      setErrors(prevErrors => {
        const { clinicSource: _, ...remainingErrors } = prevErrors;
        return remainingErrors;
      });
      return { ...prev, clinicSource: newClinicSource };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      try {
        setIsSubmitting(true);
  
        // Prepare data to send
        const dataToSend = {
          weight: formData.weight.value,
          height: {
            feet: Number(formData.feet.value), // Ensure these are numbers
            inches: Number(formData.inches.value), // Ensure these are numbers
          },
          occupation: formData.occupation,
          country: formData.country.value,
          state: formData.state.value,
          city: formData.city.value,
          complaint: formData.complaint,
          symptoms: formData.symptoms,
          associatedDisease: formData.associatedDisease.value,
          allopathy: formData.allopathy,
          diseaseHistory: formData.diseaseHistory.value,
          surgeryHistory: formData.surgeryHistory,
          allergies: formData.allergies,
          bodyType: formData.bodyType.value,
          clinicReferral: formData.clinicSource, // Ensure this is an array or a string as per schema
        };
  
        const token = localStorage.getItem('accessToken'); // Retrieve the token from localStorage
  
        console.log("Token", token);
        console.log('Data to Send:', dataToSend);
  
        // Make API request
        const response = await axios.post(
          'http://localhost:5000/api/patient/sendChronicForm',
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add the token to the headers
            },
          }
        );
  
        // Handle successful response
        alert(response.data.message);
        navigate('/home');
      } catch (error) {
        console.error('Submission error:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          alert('Error submitting form');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  

  return (
    <div className="flex justify-center items-center min-h-screen p-10 bg-gray-50">
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto p-8 bg-white shadow-2xl rounded">
        <div className=' flex justify-center items-center text-xl text-gray-700 font-bold'>Chronic Form</div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm  font-bold mb-2">Height</label>
          <div className="flex space-x-4">
            <Select
              options={feetOptions}
              placeholder="Feet"
              styles={customStyles}
              onChange={option => handleChange('feet', option)}
              className="flex-1"
            />
            <Select
              options={inchesOptions}
              placeholder="Inches"
              styles={customStyles}
              onChange={option => handleChange('inches', option)}
              className="flex-1"
            />
          </div>
          {errors.feet && <p className="text-red-500 text-xs italic">{errors.feet}</p>}
          {errors.inches && <p className="text-red-500 text-xs italic">{errors.inches}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Weight (kg)</label>
          <Select
            options={weightOptions}
            placeholder="Select Weight"
            styles={customStyles}
            defaultvalue={formData.weight}
            onChange={option => handleChange('weight', option)}
          />
          {errors.weight && <p className="text-red-500 text-xs italic">{errors.weight}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Occupation</label>
          <input
            type="text"
            value={formData.occupation}
            onChange={e => handleChange('occupation', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your occupation"
          />
          {errors.occupation && <p className="text-red-500 text-xs italic">{errors.occupation}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Country</label>
          <Select
            options={countryOptions}
            placeholder="Country"
            styles={customStyles}
            onChange={option => handleChange('country', option)}
          />
          {errors.country && <p className="text-red-500 text-xs italic">{errors.country}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">State</label>
          <Select
            options={stateOptions}
            placeholder="State"
            styles={customStyles}
            onChange={option => handleChange('state', option)}
          />
          {errors.state && <p className="text-red-500 text-xs italic">{errors.state}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
          <Select
            options={cityOptions}
            placeholder="Select City"
            styles={customStyles}
            onChange={option => handleChange('city', option)}
          />
          {errors.city && <p className="text-red-500 text-xs italic">{errors.city}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Disease</label>
          <Select
            options={diseaseOptions}
            placeholder="Disease"
            styles={customStyles}
            onChange={option => handleChange('disease', option)}
          />
          {errors.disease && <p className="text-red-500 text-xs italic">{errors.disease}</p>}
        </div>

        {showSymptomField && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Symptom</label>
            <input
              type="text"
              placeholder="Symptom"
              value={formData.symptom}
              onChange={(e) => handleChange('symptom', e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            />
            {errors.symptom && <p className="text-red-500 text-xs italic">{errors.symptom}</p>}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Associated Disease</label>
          <Select
            options={associatedDiseaseOption}
            placeholder="Select Associated Disease"
            styles={customStyles}
            onChange={option => handleChange('associatedDisease', option)}
          />
          {errors.associatedDisease && <p className="text-red-500 text-xs italic">{errors.associatedDisease}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Medicine Consuming</label>
          <input
            type="text"
            value={formData.medicineConsuming}
            onChange={e => handleChange('medicineConsuming', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter medicine consuming"
          />
          {errors.medicineConsuming && <p className="text-red-500 text-xs italic">{errors.medicineConsuming}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2"> History of Disease</label>
          <Select
            options={historyDiseasesOption}
            placeholder="Select Disease History"
            styles={customStyles}
            onChange={option => handleChange('diseaseHistory', option)}
          />
          {errors.diseaseHistory && <p className="text-red-500 text-xs italic">{errors.diseaseHistory}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">History of Surgery </label>
          <input
            type="text"
            value={formData.surgeryHistory}
            onChange={e => handleChange('surgeryHistory', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter surgery history"
          />
          {errors.surgeryHistory && <p className="text-red-500 text-xs italic">{errors.surgeryHistory}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Family History</label>
          <input
            type="text"
            value={formData.familyHistory}
            onChange={e => handleChange('familyHistory', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter family history"
          />
          {errors.familyHistory && <p className="text-red-500 text-xs italic">{errors.familyHistory}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Allergies</label>
          <input
            type="text"
            value={formData.allergies}
            onChange={e => handleChange('allergies', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter allergies"
          />
          {errors.allergies && <p className="text-red-500 text-xs italic">{errors.allergies}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Body Type</label>
          <Select
            options={bodyTypeOptions}
            placeholder="Select Body Type"
            styles={customStyles}
            onChange={option => handleChange('bodyType', option)}
          />
          {errors.bodyType && <p className="text-red-500 text-xs italic">{errors.bodyType}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">How did you find our katyayani clinic?</label>
          {options.map(option => (
            <div key={option}>
              <input
              
                type="checkbox"
                value={option}
                checked={formData.clinicSource.includes(option)}
                onChange={handleCheckboxChange}

                
              />
              <label className="ml-2 text-grey-500">{option}</label>
            </div>
          ))}
          {errors.clinicSource && <p className="text-red-500 text-xs italic">{errors.clinicSource}</p>}
        </div>
        <div className="mb-4 flex justify-center items-center  ">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
