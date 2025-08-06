import React, { useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import '../App.css';

const countries = [
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'RU', name: 'Russia', dialCode: '+7' },
];

const consultingPersons = [
  { value: 'Self', label: 'Self' },
  { value: 'Husband', label: 'Husband' },
  { value: 'Wife', label: 'Wife' },
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Father-in-law', label: 'Father-in-law' },
  { value: 'Mother-in-law', label: 'Mother-in-law' },
  { value: 'Son-in-law', label: 'Son-in-law' },
  { value: 'Daughter-in-law', label: 'Daughter-in-law' },
  { value: 'Friend', label: 'Friend' }
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

const ageOptions = Array.from({ length: 80 }, (_, i) => ({ value: i + 1, label: (i + 1).toString() }));

const consultingReasons = [
  "Accidents", "Acute Back Pain", "Acute Bronchitis", "Acute Contact Dermatitis", "Acute migraine / headache",
  "Acute Eczema Flare-ups", "Acute Kidney Injury", "Acute viral fever", "Acute Pelvic Inflammatory Disease (PID)",
  "Acute Sinusitis", "Acute Urticaria", "Alzheimer's Disease", "Allergic cough", "Allergic skin rashes",
  "Ankylosing Spondylitis", "Asthma", "Atrial Fibrillation", "Bipolar Disorder", "Boils, abscess",
  "Breast Cancer", "Chronic Bronchitis", "Chronic Hepatitis (B and C)", "Chronic Kidney Disease",
  "Chronic Migraine", "Chronic Obstructive Pulmonary Disease", "Colorectal Cancer", "Common Cold",
  "Coronary Artery Disease", "COVID-19", "Crohn's Disease", "Croup", "Dengue Fever",
  "Diabetes (Type 1 and Type 2)", "Diabetic Nephropathy", "Epilepsy", "Fibromyalgia",
  "Gastroenteritis", "Generalized Anxiety Disorder", "Glomerulonephritis", "Heart Failure",
  "Head injury", "Hypertension (High Blood Pressure)", "Hyperthyroidism", "Hypothyroidism",
  "Injury, cuts, burns, bruise, blow", "Impetigo", "Influenza (Flu)", "Irritable Bowel Syndrome (IBS)",
  "Leukemia", "Lung Cancer", "Major Depressive Disorder", "Malaria", "Metabolic Syndrome",
  "Multiple Sclerosis", "Nephrolithiasis (Kidney Stones)", "Non-Alcoholic Fatty Liver Disease",
  "Osteoarthritis", "Osteoporosis", "Oral Ulcers", "Parkinson's Disease", "Peripheral Artery Disease",
  "Polycystic Kidney Disease", "Polycystic Ovary Syndrome (PCOS)", "Post-Traumatic Stress Disorder (PTSD)",
  "Prostate Cancer", "Psoriasis", "Pulmonary Hypertension", "Rheumatoid Arthritis", "Schizophrenia",
  "Scleroderma", "Sjogren's Syndrome", "Sprains and Strains", "Strep Throat",
  "Systemic Lupus Erythematosus (SLE)", "Tooth Pain", "Trauma", "Ulcerative Colitis",
  "Urinary Tract Infection (UTI)", "Other"
];

const consultingReasonOptions = consultingReasons.map(reason => ({
  value: reason,
  label: reason,
}));

const locationOptions = [
  { value: "Urban", label: "Urban" },
  { value: "Rural", label: "Rural" },
  { value: "Suburban", label: "Suburban" }
];

const patientEntryOptions = [
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "Google", label: "Google" }
];

const FirstForm = () => {
  const [formData, setFormData] = useState({
    consultingFor: '',
    fullName: '',
    age: '',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    gender: '',
    consultingReason: '',
    symptom: '',
    currentLocation: '',
    patientEntry: '',
  });

  const [formError, setFormError] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(countries[0].dialCode);
  const [selectedCountryWhatsApp, setSelectedCountryWhatsApp] = useState(countries[0].dialCode);
  const [isWhatsAppSame, setIsWhatsAppSame] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [symptomError, setSymptomError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({...prevData, [name]: value }));
    
    if (name === 'symptom') {
      if (value.length < 40) {
        setSymptomError('Please enter at least 40 characters for the symptom.');
      } else {
        setSymptomError('');
      }
    }

    if (formError[name]) {
      setFormError(prevErrors => ({...prevErrors, [name]: '' }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prevData => ({...prevData, [name]: selectedOption ? selectedOption.value : '' }));
    if (formError[name]) {
      setFormError(prevErrors => ({...prevErrors, [name]: '' }));
    }
  };

  const handleCountryChange = (e) => {
    const selected = countries.find(country => country.code === e.target.value);
    setSelectedCountry(selected.dialCode);
  };

  const handleCountryChangeWhatsApp = (e) => {
    const selected = countries.find(country => country.code === e.target.value);
    setSelectedCountryWhatsApp(selected.dialCode);
  };

  const handleWhatsAppSameChange = (e) => {
    const isChecked = e.target.checked;
    setIsWhatsAppSame(isChecked);
    if (isChecked) {
      setFormData(prevData => ({
       ...prevData,
        whatsappNumber: prevData.mobileNumber
      }));
      setSelectedCountryWhatsApp(selectedCountry);
    } else {
      setFormData(prevData => ({
       ...prevData,
        whatsappNumber: ''
      }));
    }
  };

  const sendMessage = async (formData, patientId) => {
    try {
      const phoneNumber = `${selectedCountry}${formData.mobileNumber}`;
      
      const messageData = {
        to: phoneNumber,
        patientId: patientId,
        message: `Dear ${formData.fullName},\n\nThank you for registering with our medical consultation service. We have received your request for consultation regarding ${formData.consultingReason}.\n\nOur medical team will contact you shortly.\n\nBest regards,\nMedical Consultation Team`
      };

      const response = await axios.post('http://localhost:5000/api/log/send-first-message', messageData);
      
      if (response.data.success) {
        console.log('Message sent successfully');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
  
    // Validation
    if (!formData.consultingFor) errors.consultingFor = 'This field is required';
    if (!formData.fullName) errors.fullName = 'This field is required';
    if (!formData.age) errors.age = 'This field is required';
    if (!formData.mobileNumber) errors.mobileNumber = 'This field is required';
    if (!formData.email) errors.email = 'This field is required';
    if (!formData.gender) errors.gender = 'This field is required';
    if (!formData.consultingReason) errors.consultingReason = 'This field is required';
    if (!formData.currentLocation) errors.currentLocation = 'This field is required';
    if (!formData.patientEntry) errors.patientEntry = 'This field is required';
  
    if (Object.keys(errors).length === 0) {
      try {
        setIsSubmitting(true);
  
        // Get referral code from URL if it exists
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('referralCode');
        const familyToken = urlParams.get('familyToken');
  
        let predictedDiseaseName = '';
        let predictedDiseaseType = '';
  
        if (formData.consultingReason === 'Other' && formData.symptom) {
          const predictionData = {
            consultingReason: formData.consultingReason,
            symptom: formData.symptom,
          };
  
          const predictionResponse = await axios.post(
            'http://localhost:5000/api/forms/predict',
            predictionData
          );
  
          const predictionMessage = predictionResponse.data.message;
          const diseaseMatch = predictionMessage.match(/The predicted disease is "([^"]+)"/);
          const typeMatch = predictionMessage.match(/predicted condition is (\w+)/);
  
          if (diseaseMatch && typeMatch) {
            predictedDiseaseName = diseaseMatch[1];
            predictedDiseaseType = typeMatch[1];
          }
  
          setPrediction(predictionMessage);
        }
  
        const fullFormData = {
          consultingFor: formData.consultingFor,
          name: formData.fullName,
          age: parseInt(formData.age),
          phone: `${selectedCountry}${formData.mobileNumber}`,
          whatsappNumber: isWhatsAppSame
            ? `${selectedCountry}${formData.mobileNumber}`
            : `${selectedCountryWhatsApp}${formData.whatsappNumber}`,
          email: formData.email,
          gender: formData.gender,
          diseaseName: formData.consultingReason === 'Other' ? predictedDiseaseName : formData.consultingReason,
          diseaseType: {
            name: predictedDiseaseType || '',
            edit: false,
          },
          currentLocation: formData.currentLocation,
          patientEntry: formData.patientEntry,
          symptomNotKnown: formData.symptom || '', // Add symptom if available
        };
  
        // Create URL with query parameters if they exist
        const apiUrl = new URL('http://localhost:5000/api/patient/sendRegForm');
        if (referralCode) {
          apiUrl.searchParams.append('referralCode', referralCode);
        }
        if (familyToken) {
          apiUrl.searchParams.append('familyToken', familyToken);
        }
  
        const patientResponse = await axios.post(
          apiUrl.toString(),
          fullFormData
        );
  
        if (patientResponse.data.success || patientResponse.status === 201) {
          const patientId = patientResponse.data.patientId;
          if (typeof sendMessage === 'function') {
            await sendMessage(formData, patientId);
          }
  
          alert('Form Submitted Successfully');
  
          // Reset form
          setFormData({
            consultingFor: '',
            fullName: '',
            age: '',
            mobileNumber: '',
            whatsappNumber: '',
            email: '',
            gender: '',
            consultingReason: '',
            symptom: '',
            currentLocation: '',
            patientEntry: '',
          });
          setIsWhatsAppSame(false);
          setSelectedCountry(countries[0].dialCode);
          setSelectedCountryWhatsApp(countries[0].dialCode);
          setPrediction(null);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // Display a user-friendly error message
          alert(error.response.data.message || 'Bad Request');
        } else {
          console.error('Submission error:', error);
          alert('Error submitting form');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormError(errors);
    }
  };
  
  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="patient-form">
        <h2 className="form-title">Registration Form</h2>

        {/* Consulting Person */}
        <div className="form-group">
          <label htmlFor="consultingFor">Consulting Person</label>
          <Select
            name="consultingFor"
            options={consultingPersons}
            value={consultingPersons.find(option => option.value === formData.consultingFor) || null}
            onChange={(selectedOption) => handleSelectChange('consultingFor', selectedOption)}
            className="select-input"
          />
          {formError.consultingFor && <div className="error">{formError.consultingFor}</div>}
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
          />
          {formError.fullName && <div className="error">{formError.fullName}</div>}
        </div>

        {/* Age */}
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <Select
            name="age"
            options={ageOptions}
            value={ageOptions.find(option => option.value === formData.age) || null}
            onChange={(selectedOption) => handleSelectChange('age', selectedOption)}
            className="select-input"
          />
          {formError.age && <div className="error">{formError.age}</div>}
        </div>

        {/* Mobile Number */}
        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number</label>
          <div className="phone-input">
            <select
              name="countryCode"
              onChange={handleCountryChange}
              value={countries.find(country => country.dialCode === selectedCountry)?.code}
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.dialCode} {country.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
            />
          </div>
          {formError.mobileNumber && <div className="error">{formError.mobileNumber}</div>}
        </div>

        {/* WhatsApp Same as Mobile */}
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="whatsappSame"
            checked={isWhatsAppSame}
            onChange={handleWhatsAppSameChange}
          />
          <label htmlFor="whatsappSame">WhatsApp number is same as mobile number</label>
        </div>

        {/* WhatsApp Number */}
        <div className="form-group">
          <label htmlFor="whatsappNumber">WhatsApp Number</label>
          <div className="phone-input">
            <select
              name="whatsappCountryCode"
              onChange={handleCountryChangeWhatsApp}
              value={countries.find(country => country.dialCode === selectedCountryWhatsApp)?.code}
              disabled={isWhatsAppSame}
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.dialCode} {country.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              id="whatsappNumber"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              disabled={isWhatsAppSame}
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          {formError.email && <div className="error">{formError.email}</div>}
        </div>

        {/* Gender */}
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <Select
            name="gender"
            options={genderOptions}
            value={genderOptions.find(option => option.value === formData.gender) || null}
            onChange={(selectedOption) => handleSelectChange('gender', selectedOption)}
            className="select-input"
          />
          {formError.gender && <div className="error">{formError.gender}</div>}
        </div>

        {/* Consulting Reason */}
        <div className="form-group">
          <label htmlFor="consultingReason">Consulting Reason</label>
          <Select
            name="consultingReason"
            options={consultingReasonOptions}
            value={consultingReasonOptions.find(option => option.value === formData.consultingReason) || null}
            onChange={(selectedOption) => handleSelectChange('consultingReason', selectedOption)}
            className="select-input"
          />
          {formError.consultingReason && <div className="error">{formError.consultingReason}</div>}
        </div>

        {/* Symptom */}
        {formData.consultingReason === 'Other' && (
          <div className="form-group">
            <label htmlFor="symptom">Symptom</label>
            <input
              type="text"
              id="symptom"
              name="symptom"
              value={formData.symptom}
              onChange={handleInputChange}
            />
            {symptomError && <div className="error">{symptomError}</div>}
          </div>
        )}

        {/* Current Location */}
        <div className="form-group">
          <label htmlFor="currentLocation">Current Location</label>
          <input
            type="text"
            id="currentLocation"
            name="currentLocation"
            value={formData.currentLocation}
            onChange={handleInputChange}
          />
          {formError.currentLocation && <div className="error">{formError.currentLocation}</div>}
        </div>

        {/* Patient Entry */}
        <div className="form-group">
          <label htmlFor="patientEntry">How did you find us?</label>
          <Select
            name="patientEntry"
            options={patientEntryOptions}
            value={patientEntryOptions.find(option => option.value === formData.patientEntry) || null}
            onChange={(selectedOption) => handleSelectChange('patientEntry', selectedOption)}
            className="select-input"
          />
          {formError.patientEntry && <div className="error">{formError.patientEntry}</div>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default FirstForm;
