import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const login = async (phoneNumber, password, role) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      phoneNumber,
      password,
      role
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response || error.message);
    throw error;
  }
};
