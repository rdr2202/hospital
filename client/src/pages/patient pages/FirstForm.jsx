import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../../config";
const countries = [
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94" },
  { code: "CN", name: "China", dialCode: "+86" },
  { code: "RU", name: "Russia", dialCode: "+7" },
];

const consultingPersons = [
  { value: "Self", label: "Self" },
  { value: "Husband", label: "Husband" },
  { value: "Wife", label: "Wife" },
  { value: "Son", label: "Son" },
  { value: "Daughter", label: "Daughter" },
  { value: "Father", label: "Father" },
  { value: "Mother", label: "Mother" },
  { value: "Father-in-law", label: "Father-in-law" },
  { value: "Mother-in-law", label: "Mother-in-law" },
  { value: "Son-in-law", label: "Son-in-law" },
  { value: "Daughter-in-law", label: "Daughter-in-law" },
  { value: "Friend", label: "Friend" },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const ageOptions = Array.from({ length: 80 }, (_, i) => ({
  value: i + 1,
  label: (i + 1).toString(),
}));

const consultingReasons = [
  "Accidents",
  "Acute Back Pain",
  "Acute Bronchitis",
  "Acute Contact Dermatitis",
  "Acute migraine / headache",
  "Acute Eczema Flare-ups",
  "Acute Kidney Injury",
  "Acute viral fever",
  "Acute Pelvic Inflammatory Disease (PID)",
  "Acute Sinusitis",
  "Acute Urticaria",
  "Alzheimer's Disease",
  "Allergic cough",
  "Allergic skin rashes",
  "Ankylosing Spondylitis",
  "Asthma",
  "Atrial Fibrillation",
  "Bipolar Disorder",
  "Boils, abscess",
  "Breast Cancer",
  "Chronic Bronchitis",
  "Chronic Hepatitis (B and C)",
  "Chronic Kidney Disease",
  "Chronic Migraine",
  "Chronic Obstructive Pulmonary Disease",
  "Colorectal Cancer",
  "Common Cold",
  "Coronary Artery Disease",
  "COVID-19",
  "Crohn's Disease",
  "Croup",
  "Dengue Fever",
  "Diabetes (Type 1 and Type 2)",
  "Diabetic Nephropathy",
  "Epilepsy",
  "Fibromyalgia",
  "Gastroenteritis",
  "Generalized Anxiety Disorder",
  "Glomerulonephritis",
  "Heart Failure",
  "Head injury",
  "Hypertension (High Blood Pressure)",
  "Hyperthyroidism",
  "Hypothyroidism",
  "Injury, cuts, burns, bruise, blow",
  "Impetigo",
  "Influenza (Flu)",
  "Irritable Bowel Syndrome (IBS)",
  "Leukemia",
  "Lung Cancer",
  "Major Depressive Disorder",
  "Malaria",
  "Metabolic Syndrome",
  "Multiple Sclerosis",
  "Nephrolithiasis (Kidney Stones)",
  "Non-Alcoholic Fatty Liver Disease",
  "Osteoarthritis",
  "Osteoporosis",
  "Oral Ulcers",
  "Parkinson's Disease",
  "Peripheral Artery Disease",
  "Polycystic Kidney Disease",
  "Polycystic Ovary Syndrome (PCOS)",
  "Post-Traumatic Stress Disorder (PTSD)",
  "Prostate Cancer",
  "Psoriasis",
  "Pulmonary Hypertension",
  "Rheumatoid Arthritis",
  "Schizophrenia",
  "Scleroderma",
  "Sjogren's Syndrome",
  "Sprains and Strains",
  "Strep Throat",
  "Systemic Lupus Erythematosus (SLE)",
  "Tooth Pain",
  "Trauma",
  "Ulcerative Colitis",
  "Urinary Tract Infection (UTI)",
  "Other",
];

const consultingReasonOptions = consultingReasons.map((reason) => ({
  value: reason,
  label: reason,
}));

const locationOptions = [
  { value: "Urban", label: "Urban" },
  { value: "Rural", label: "Rural" },
  { value: "Suburban", label: "Suburban" },
];

const patientEntryOptions = [
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "Google", label: "Google" },
];

const FirstForm = () => {
  const navigate = useNavigate();
  const API_URL = config.API_URL;
  const [formData, setFormData] = useState({
    consultingFor: "",
    fullName: "",
    age: "",
    mobileNumber: "",
    whatsappNumber: "",
    email: "",
    gender: "",
    consultingReason: "",
    symptom: "",
    currentLocation: "",
    patientEntry: "",
    password: "",
  });

  const [formError, setFormError] = useState({});
  const [selectedCountry, setSelectedCountry] = useState("+91");
  const [selectedCountryWhatsApp, setSelectedCountryWhatsApp] = useState("+91");

  const [isWhatsAppSame, setIsWhatsAppSame] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [symptomError, setSymptomError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPhonePrefilled, setIsPhonePrefilled] = useState(false);
  const [isGenderPrefilled, setIsGenderPrefilled] = useState(false); // NEW
  const [patientEntryPrefill, setPatientEntryPrefill] = useState(""); // NEW

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get("code");
    const familyToken = urlParams.get("familyToken");

    if (referralCode) {
      axios
        .get(`${API_URL}/api/patient/validateCoupon?code=${referralCode}`)
        .then((res) => {
          if (res.data.success && res.data.data) {
            const { referredFriendName, referredFriendPhone } = res.data.data;
            setFormData((prev) => ({
              ...prev,
              fullName: referredFriendName || "",
              mobileNumber: referredFriendPhone || "",
              patientEntry: "Referral",
            }));
            setIsPhonePrefilled(true);
            setPatientEntryPrefill("Referral");
          }
        })
        .catch((err) => {
          console.error("Error validating referral:", err);
        });
    }

    if (familyToken) {
      axios
        .get(
          `${API_URL}/api/patient/fetchFamilyDetails?familyToken=${familyToken}`
        )
        .then((res) => {
          if (res.data.success && res.data.data) {
            const { name, phone, gender } = res.data.data;
            setFormData((prev) => ({
              ...prev,
              fullName: name || "",
              mobileNumber: phone || "",
              gender: gender || "",
              patientEntry: "Family Member",
            }));
            setIsPhonePrefilled(true);
            setIsGenderPrefilled(true);
            setPatientEntryPrefill("Family Member");
          }
        })
        .catch((err) => {
          console.error("Error fetching family details:", err);
        });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "symptom") {
      if (value.length < 40) {
        setSymptomError("Please enter at least 40 characters for the symptom.");
      } else {
        setSymptomError("");
      }
    }

    if (formError[name]) {
      setFormError((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOption ? selectedOption.value : "",
    }));
    if (formError[name]) {
      setFormError((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const handleCountryChange = (e) => {
    const selected = countries.find(
      (country) => country.code === e.target.value
    );
    setSelectedCountry(selected.dialCode);
  };

  const handleCountryChangeWhatsApp = (e) => {
    const selected = countries.find(
      (country) => country.code === e.target.value
    );
    setSelectedCountryWhatsApp(selected.dialCode);
  };

  const handleWhatsAppSameChange = (e) => {
    const isChecked = e.target.checked;
    setIsWhatsAppSame(isChecked);
    if (isChecked) {
      setFormData((prevData) => ({
        ...prevData,
        whatsappNumber: prevData.mobileNumber,
      }));
      setSelectedCountryWhatsApp(selectedCountry);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        whatsappNumber: "",
      }));
    }
  };

  const sendMessage = async (formData, patientId) => {
    try {
      const phoneNumber = `${selectedCountry}${formData.mobileNumber}`;

      const messageData = {
        to: phoneNumber,
        patientId: patientId,
        message: `Dear ${formData.fullName},\n\nThank you for registering with our medical consultation service. We have received your request for consultation regarding ${formData.consultingReason}.\n\nOur medical team will contact you shortly.\n\nBest regards,\nMedical Consultation Team`,
      };

      const response = await axios.post(
        `${API_URL}/api/log/send-first-message`,
        messageData
      );

      if (response.data.success) {
        console.log("Message sent successfully");
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // Validation
    // if (!formData.consultingFor)
    //   errors.consultingFor = "This field is required";
    if (!formData.fullName) errors.fullName = "This field is required";
    if (!formData.age) errors.age = "This field is required";
    if (!formData.mobileNumber) errors.mobileNumber = "This field is required";
    if (!formData.email) errors.email = "This field is required";
    if (!formData.gender) errors.gender = "This field is required";
    if (!formData.consultingReason)
      errors.consultingReason = "This field is required";
    if (!formData.currentLocation)
      errors.currentLocation = "This field is required";
    if (!formData.patientEntry) errors.patientEntry = "This field is required";
    if (!formData.password) {
      errors.password = "This field is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.password = "Password must contain at least one symbol";
    }

    if (Object.keys(errors).length === 0) {
      try {
        setIsSubmitting(true);

        // Get referral code from URL if it exists
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get("referralCode");
        const familyToken = urlParams.get("familyToken");

        let predictedDiseaseName = "";
        let predictedDiseaseType = "";

        if (formData.consultingReason === "Other" && formData.symptom) {
          const predictionData = {
            consultingReason: formData.consultingReason,
            symptom: formData.symptom,
          };

          const predictionResponse = await axios.post(
            "http://localhost:5000/api/forms/predict",
            predictionData
          );

          const predictionMessage = predictionResponse.data.message;
          const diseaseMatch = predictionMessage.match(
            /The predicted disease is "([^"]+)"/
          );
          const typeMatch = predictionMessage.match(
            /predicted condition is (\w+)/
          );

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
          diseaseName:
            formData.consultingReason === "Other"
              ? predictedDiseaseName
              : formData.consultingReason,
          diseaseType: {
            name: predictedDiseaseType || "",
            edit: false,
          },
          currentLocation: formData.currentLocation,
          patientEntry: formData.patientEntry,
          symptomNotKnown: formData.symptom || "", // Add symptom if available
          password: formData.password,
        };

        // Create URL with query parameters if they exist
        const apiUrl = new URL(`${API_URL}/api/patient/sendRegForm`);
        if (referralCode) {
          apiUrl.searchParams.append("referralCode", referralCode);
        }
        if (familyToken) {
          apiUrl.searchParams.append("familyToken", familyToken);
        }

        const patientResponse = await axios.post(
          apiUrl.toString(),
          fullFormData
        );

        if (patientResponse.data.success || patientResponse.status === 201) {
          const patientId = patientResponse.data.patientId;
          if (typeof sendMessage === "function") {
            await sendMessage(formData, patientId);
          }

          alert("Form Submitted Successfully");

          // Reset form
          setFormData({
            consultingFor: "",
            fullName: "",
            age: "",
            mobileNumber: "",
            whatsappNumber: "",
            email: "",
            gender: "",
            consultingReason: "",
            symptom: "",
            currentLocation: "",
            patientEntry: "",
          });
          setIsWhatsAppSame(false);
          setSelectedCountry(countries[0].dialCode);
          setSelectedCountryWhatsApp(countries[0].dialCode);
          setPrediction(null);
        }
        navigate("/login");
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // Display a user-friendly error message
          alert(error.response.data.message || "Bad Request");
        } else {
          console.error("Submission error:", error);
          alert("Error submitting form");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormError(errors);
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#e5e7eb",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#e0f2fe"
        : null,
      color: state.isSelected ? "white" : "#374151",
    }),
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
          <h2 className="text-2xl font-bold text-white">
            Patient Registration Form
          </h2>
          <p className="text-blue-100 mt-1">
            Please complete all required fields
          </p>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Consulting Person
          <div className="col-span-1">
            <label
              htmlFor="consultingFor"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Consulting For <span className="text-red-500">*</span>
            </label>
            <Select
              name="consultingFor"
              options={consultingPersons}
              value={
                consultingPersons.find(
                  (option) => option.value === formData.consultingFor
                ) || null
              }
              onChange={(selectedOption) =>
                handleSelectChange("consultingFor", selectedOption)
              }
              styles={customSelectStyles}
              placeholder="Select..."
              className="mt-1"
            />
            {formError.consultingFor && (
              <div className="mt-1 text-sm text-red-600">
                {formError.consultingFor}
              </div>
            )}
          </div> */}

          {/* Full Name */}
          <div className="col-span-1">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
              placeholder="Enter your full name"
            />
            {formError.fullName && (
              <div className="mt-1 text-sm text-red-600">
                {formError.fullName}
              </div>
            )}
          </div>

          {/* Age */}
          <div className="col-span-1">
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Age <span className="text-red-500">*</span>
            </label>
            <Select
              name="age"
              options={ageOptions}
              value={
                ageOptions.find((option) => option.value === formData.age) ||
                null
              }
              onChange={(selectedOption) =>
                handleSelectChange("age", selectedOption)
              }
              styles={customSelectStyles}
              placeholder="Select age"
              className="mt-1"
            />
            {formError.age && (
              <div className="mt-1 text-sm text-red-600">{formError.age}</div>
            )}
          </div>

          {/* Gender */}
          <div className="col-span-1">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender <span className="text-red-500">*</span>
            </label>
            <Select
              name="gender"
              options={genderOptions}
              value={
                genderOptions.find(
                  (option) => option.value === formData.gender
                ) || null
              }
              onChange={(selectedOption) =>
                handleSelectChange("gender", selectedOption)
              }
              isDisabled={isGenderPrefilled} // Disable when phone prefilled
              styles={customSelectStyles}
              placeholder="Select gender"
              className="mt-1"
            />

            {formError.gender && (
              <div className="mt-1 text-sm text-red-600">
                {formError.gender}
              </div>
            )}
          </div>

          {/* Mobile Number */}
          <div className="col-span-1">
            <label
              htmlFor="mobileNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              {/* <select
                name="countryCode"
                onChange={handleCountryChange}
                value={
                  countries.find(
                    (country) => country.dialCode === selectedCountry
                  )?.code
                }
                className="rounded-l-md border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.dialCode} {country.name}
                  </option>
                ))}
              </select> */}
              <span className="inline-flex items-center rounded-l-md border border-gray-300 bg-gray-50 text-gray-700 text-sm px-3">
                +91
              </span>

              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                disabled={isPhonePrefilled}
                className={`block w-full rounded-r-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border ${
                  isPhonePrefilled ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                placeholder="Enter mobile number"
              />
            </div>
            {formError.mobileNumber && (
              <div className="mt-1 text-sm text-red-600">
                {formError.mobileNumber}
              </div>
            )}
          </div>

          {/* WhatsApp Same as Mobile */}
          <div className="col-span-1 flex items-center mt-6">
            <input
              type="checkbox"
              id="whatsappSame"
              checked={isWhatsAppSame}
              onChange={handleWhatsAppSameChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="whatsappSame"
              className="ml-2 text-sm text-gray-700"
            >
              WhatsApp number is same as mobile number
            </label>
          </div>

          {/* WhatsApp Number */}
          <div className="col-span-1">
            <label
              htmlFor="whatsappNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              WhatsApp Number
            </label>
            <div className="flex">
              {/* <select
                name="whatsappCountryCode"
                onChange={handleCountryChangeWhatsApp}
                value={
                  countries.find(
                    (country) => country.dialCode === selectedCountryWhatsApp
                  )?.code
                }
                disabled={isWhatsAppSame}
                className={`rounded-l-md border-r-0 border-gray-300 text-gray-700 text-sm py-2 px-3 ${
                  isWhatsAppSame ? "bg-gray-100" : "bg-gray-50"
                }`}
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.dialCode} {country.name}
                  </option>
                ))}
              </select> */}
              <span className="inline-flex items-center rounded-l-md border border-gray-300 bg-gray-50 text-gray-700 text-sm px-3">
                +91
              </span>

              <input
                type="text"
                id="whatsappNumber"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                disabled={isWhatsAppSame}
                className={`block w-full rounded-r-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border ${
                  isWhatsAppSame ? "bg-gray-100" : ""
                }`}
                placeholder="Enter WhatsApp number"
              />
            </div>
          </div>

          {/* Email */}
          <div className="col-span-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
              placeholder="your.email@example.com"
            />
            {formError.email && (
              <div className="mt-1 text-sm text-red-600">{formError.email}</div>
            )}
          </div>

          {/* Consulting Reason */}
          <div className="col-span-1">
            <label
              htmlFor="consultingReason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason for Consultation <span className="text-red-500">*</span>
            </label>
            <Select
              name="consultingReason"
              options={consultingReasonOptions}
              value={
                consultingReasonOptions.find(
                  (option) => option.value === formData.consultingReason
                ) || null
              }
              onChange={(selectedOption) =>
                handleSelectChange("consultingReason", selectedOption)
              }
              styles={customSelectStyles}
              placeholder="Select reason"
              className="mt-1"
            />
            {formError.consultingReason && (
              <div className="mt-1 text-sm text-red-600">
                {formError.consultingReason}
              </div>
            )}
          </div>

          {/* Symptom */}
          {formData.consultingReason === "Other" && (
            <div className="col-span-1">
              <label
                htmlFor="symptom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Specify Symptom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="symptom"
                name="symptom"
                value={formData.symptom}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                placeholder="Please describe your symptoms"
              />
              {symptomError && (
                <div className="mt-1 text-sm text-red-600">{symptomError}</div>
              )}
            </div>
          )}

          {/* Current Location */}
          <div className="col-span-1">
            <label
              htmlFor="currentLocation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="currentLocation"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
              placeholder="City, State, Country"
            />
            {formError.currentLocation && (
              <div className="mt-1 text-sm text-red-600">
                {formError.currentLocation}
              </div>
            )}
          </div>

          {/* Patient Entry */}
          <div className="col-span-1">
            <label
              htmlFor="patientEntry"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              How did you find us? <span className="text-red-500">*</span>
            </label>
            <Select
              name="patientEntry"
              options={patientEntryOptions}
              value={
                patientEntryPrefill
                  ? { value: patientEntryPrefill, label: patientEntryPrefill } // freeze value
                  : patientEntryOptions.find(
                      (option) => option.value === formData.patientEntry
                    ) || null
              }
              onChange={(selectedOption) =>
                handleSelectChange("patientEntry", selectedOption)
              }
              isDisabled={!!patientEntryPrefill} // Disable if prefilled
              styles={customSelectStyles}
              placeholder="Select option"
              className="mt-1"
            />

            {formError.patientEntry && (
              <div className="mt-1 text-sm text-red-600">
                {formError.patientEntry}
              </div>
            )}
          </div>

          {/* password */}
          <div className="col-span-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formError.password && (
              <div className="mt-1 text-sm text-red-600">
                {formError.password}
              </div>
            )}
          </div>
        </div>

        {/* Form Footer with Submit Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Registration"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FirstForm;
