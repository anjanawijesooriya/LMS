import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, Spin } from "antd";
import "./Login Register.scss";

import { LoadingOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import PasswordResetRequest from "./PasswordResetRequest";
import { FaLock, FaEnvelope } from "react-icons/fa";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { loginUser } from "../../redux/features/auth/authActions";

const Login = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [available, setAvailable] = useState("");
  const [loading, setLoading] = useState(false); //additional
  const [isError, setIsError] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const history = useNavigate();
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    user,
    loading: authLoading,
    error: authError,
  } = useSelector(selectAuthState);

  useEffect(() => {
    if (isAuthenticated && user) {
      setTimeout(() => {
        history(
          user.role === "admin"
            ? `/admin-dashboard/${user.firstName}`
            : `/user-dashboard/${user.firstName}`
        );
      }, 3000);
    }
  }, [isAuthenticated, user, history]); // Redirect when user state updates

  const validateEmail = (email) => {
    return /^[\w-.]+@[\w-]+\.[a-z]{2,}$/.test(email);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setIsValid(value.length >= 6 && value.length <= 20);
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (password.length < 6 || password.length > 20) {
      setError("Password must be between 6 and 20 characters");
      return;
    }
    //handler method for login

    setLoading(true);
    setIsError(false); //additional

    try {
      dispatch(loginUser({ email, password }));
      setTimeout(() => {
        // set a 5seconds timeout for authentication
        setLoading(false);
      }, 5000);
    } catch (error) {
      setLoading(false);
      setIsError(true);

      // Safely extract error message
      const errorMessage =
        error?.response?.data?.error ||
        (error?.status === 401
          ? "Invalid credentials. Please try again."
          : error?.status === 404
          ? "User does not exist. Please register first."
          : "Something went wrong. Please try again.");

      setError(errorMessage);
      console.log(errorMessage);

      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2
          className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6 cursor-pointer"
          onClick={() => (window.location.href = "/")}
        >
          {" "}
          Devians - LMS
        </h2>
        <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white mb-6">
          Welcome Back
        </h2>
        <form onSubmit={loginHandler} className="space-y-4">
          {(error || authError) && (
            <p className="text-red-500 text-sm text-center bg-red-100 py-2 rounded-md">
              {error || authError}
            </p>
          )}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          {/* Password length validation message */}
          {password.length > 0 && !isValid && (
            <p className="text-red-500 text-sm mb-2">
              Password must be between 6 and 20 characters.
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition duration-300"
            disabled={loading}
          >
            {loading ? <Spin indicator={<LoadingOutlined />} /> : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center text-blue-500 cursor-pointer hover:underline">
          <PasswordResetRequest />
        </div>
        <div className="mt-2 text-center">
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            Don't have an account?
            <Link to="/register" className="text-blue-500 hover:underline">
              {" "}
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
