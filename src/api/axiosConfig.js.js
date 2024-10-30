import axios from "axios";
import { getCookie } from "cookies-next";

// Get token from cookies
const token = getCookie("usertoken");

// Get the base URL from environment variables
const apiBaseURL = process.env.SERVER_URL;

// Create Axios instance
const axiosInstance = axios.create({
  // baseURL: "http://localhost:5000",
  baseURL: "https://social-backend-final-9ncr.onrender.com",
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

export default axiosInstance;
