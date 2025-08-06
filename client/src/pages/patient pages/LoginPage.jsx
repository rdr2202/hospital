import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import homeo from '/src/assets/images/patient images/homeo.png'; // Ensure this path is correct
import config from '../../config';
const API_URL = config.API_URL;

const LoginPage = () => {
  const [role, setRole] = useState(''); // 'doctor' or 'patient'
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(true); // Password field initially visible
  const [errors, setErrors] = useState({ mobileNumber: '', password: '', otp: '' });
  const [showOtpInput, setShowOtpInput] = useState(false); // Controls when OTP field is shown
  const [otpSent, setOtpSent] = useState(false);
  const [loginWithOTP, setLoginWithOTP] = useState(false); // Checkbox state
  const [otpArray, setOtpArray] = useState(Array(6).fill(''));
  const initialTime = 15 * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const navigate = useNavigate();

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      let newOtpArray = [...otpArray];
      newOtpArray[index] = value;

      setOtpArray(newOtpArray);
      setOtp(newOtpArray.join(''));

      // Automatically move to the next input field if a digit is entered
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      // Move focus to the previous input when backspacing on an empty input
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  useEffect(() => {
    // Initialize role from local storage
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setRole(savedRole);
    } else {
      // Default role
      setRole('patient');
    }
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, []);

  // Function to format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = { mobileNumber: '', password: '', otp: '' };

    if (!mobileNumber) {
      newErrors.mobileNumber = 'This field is required';
      isValid = false;
    } else if (!/^\+91\d{10}$/.test(mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number starting with +91';
      isValid = false;
    }

    if (!loginWithOTP && !password) {
      newErrors.password = 'This field is required';
      isValid = false;
    } else if (!loginWithOTP && !/^(?=.*[@$!%*?&])[\S]{6,}$/.test(password)) {
      newErrors.password ='Password must be at least 6 characters long and include at least one letter and one special character (no spaces)';
      isValid = false;
    }

    if (showOtpInput && !otp) {
      newErrors.otp = 'This field is required';
      isValid = false;
    } else if (showOtpInput && !/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must be exactly 6 numeric digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const sendOtp = async () => {
    if (validateFields()) {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const response = await axios.post(`${API_URL}/api/otp/send-otp`, { 
          phone: mobileNumber,
          role: role === 'patient' ? 'Patient' : 'Doctor',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );
        
        if (response.data.success) {
          setOtpSent(true); // Set OTP sent to true
          setShowOtpInput(true); // Show OTP input after OTP is sent
          alert('OTP sent successfully!');
        } else {
          alert('Failed to send OTP: ' + response.data.message);
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Error sending OTP.');
      }
    }
  };

  const verifyOtp = async () => {
    if (validateFields()) {
      try {
        const response = await axios.post(`${API_URL}/api/otp/verifyOtp`, {
          phone: mobileNumber,
          userOTP: otp,
          userType: role === 'patient' ? 'Patient' : 'Doctor',
        });
        console.log("response", response);
        if (response.data.success) {
          setShowOtpInput(false);
          // localStorage.removeItem('accessToken');
          localStorage.setItem('token', response.data.accessToken); // Save token
          localStorage.setItem('userId', response.data.userId); // Save token
          localStorage.setItem('userType', response.data.userType); // Save token
          alert('OTP verified successfully!');
          if (role === 'doctor') {
            localStorage.setItem('role', response.data.role); 
            navigate('/dashboard'); // Redirect to Doctor Dashboard
          } else if (role === 'patient') {
            // navigate('/form'); // Redirect to Patient Dashboard
            navigate('/home'); // Redirect to Patient Dashboard
          }
          window.location.reload(); // Reload page after success
        } else {
          alert('Invalid or expired OTP');
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
        alert('Error verifying OTP.');
      }
    }
  };

  const handleLogin = async () => {
    if (!validateFields()) return;
  
    try {
      const response = await axios.post(`${API_URL}/api/otp/loginWithPassword`, {
        phone: mobileNumber,
        password,
        role: role === 'doctor' ? 'Doctor' : 'Patient' // Backend expects capitalized role
      });
  
      if (response.data.success) {
        const { accessToken, refreshToken, userId, userType } = response.data;
  
        // Store tokens securely (avoid localStorage in real apps, use HttpOnly cookies)
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userType", userType);
        
        if (userType === "Patient") {
          navigate("/home");
        } else if (userType === "Doctor") {
          localStorage.setItem("role", response.data.role);
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed");
    }
  };
  

  const handleRoleSwitch = () => {
    const newRole = role === 'doctor' ? 'patient' : 'doctor';
    localStorage.setItem('userRole', newRole);
    setRole(newRole);
    window.location.reload();
  };

  const handleRegistration = () => {
    navigate('/firstform');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
        {/* Image Section */}
        <div className="flex-1 hidden md:block flex items-center justify-center w-1/4 h-1/4">
          <img src={homeo} alt="Homeo image" className="max-w-full max-h-full object-contain bg-blue-700" />
        </div>

        {/* Login Form Section */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-semibold text-center mb-6">
            {role === 'doctor' ? 'Doctor Login' : 'Patient Login'}
          </h1>
          {/* Render Mobile Number and OTP Checkbox only if OTP is not sent */}
          {!otpSent && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="mobileNumber">
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="mobileNumber"
                  value={mobileNumber}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^\d+]/g, '');

                    if (!value.startsWith('+91')) {
                      value = '+91' + value.replace(/^\+91/, '');
                    }

                    if (value.length > 13) {
                      value = value.slice(0, 13);
                    }

                    setMobileNumber(value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your mobile number"
                />
                {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
              </div>

              {/* Show password field if login is not with OTP */}
              {!loginWithOTP && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1" htmlFor="password">
                    Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  <div className="mb-4 mt-2">
                <input
                  type="checkbox"
                  id="loginWithOtp"
                  checked={loginWithOTP}
                  onChange={() => {
                    setLoginWithOTP(!loginWithOTP);
                    setShowPassword(!loginWithOTP); // Hide password if OTP login
                    setShowOtpInput(false); // Hide OTP input initially
                  }}
                />
                <label className="ml-2 text-gray-700" htmlFor="loginWithOtp">
                  Login with OTP
                </label>
              </div>
                  {!loginWithOTP && (
                  <div className="mb-4 mt-4 flex justify-center">
                    <button
                      onClick={handleLogin}
                      className="w-1/4 bg-blue-400 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                     Login
                    </button>
                  </div>
                )}
                 
                </div>
              )}

              {/* Button to send OTP */}
              {loginWithOTP && (
                <div className="mb-4 mt-10 flex justify-center">
                  <button
                    onClick={sendOtp}
                    className="bg-blue-400 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Send OTP
                  </button>
                </div>
              )}
            </>
          )}

          {/* Display OTP input fields and verification button only after OTP is sent */}
          {otpSent && (
            <div className="mb-4 text-center">
              <h2 className="text-lg mb-2 font-bold">OTP Verification</h2>
              <p className="text-sm text-gray-500 mb-4">We will send you a one-time password to {mobileNumber}</p>
              <div className="flex justify-center space-x-2">
      {otpArray.map((digit, index) => (
        <input
          key={index}
          id={`otp-input-${index}`}
          type="text"
          value={digit}
          maxLength="1"
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-12 text-center text-blue-500 text-lg border border-blue-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      ))}
    </div>
              {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
              <div className="text-center">
              <button
                onClick={verifyOtp}
                className="bg-green-400 text-white py-2 px-4 mt-4 rounded-full shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={timeLeft === 0} // Disable button when time is up
              >
                Verify OTP
              </button>
              <div className="text-center font-semibold text-sm mt-2 text-blue-600">
              {timeLeft > 0 ? (
                <p>{formatTime(timeLeft)}</p>
              ) : (
                <p>OTP expired. Please resend the OTP.</p>
              )}
            </div>
              <div className="mt-4">
                <label className="text-blue-400 hover:text-blue-500">
                  <button onClick={sendOtp}>
                    Didn't receive any code? Resend OTP
                  </button>
                </label>
              </div>
            </div>

            </div>
          )}
  
          {/* Switch Role Button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleRoleSwitch}
              className="text-blue-500 hover:underline"
            >
              {role === 'doctor' ? 'Login as Patient' : 'Login as Doctor'}
            </button>
          </div>

          {role === 'patient' && (
            <div className="mt-4 text-center">
              <button
                onClick={handleRegistration}
                className="text-blue-500 hover:underline"
              >
                Register Patient
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
