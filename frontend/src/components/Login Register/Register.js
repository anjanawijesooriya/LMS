import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUser, FaLock, FaEnvelope, FaPhone } from "react-icons/fa";
import { notification, Spin } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { registerUser } from "../../redux/features/auth/authActions";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    grade: "",
    telephoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    user,
    loading: authLoading,
    error: authError,
  } = useSelector(selectAuthState);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      let errorMsg = "";

      // Run validation manually instead of calling validateField
      switch (key) {
        case "firstName":
          if (!formData[key].trim()) errorMsg = "First Name is required";
          break;
        case "lastName":
          if (!formData[key].trim()) errorMsg = "Last Name is required";
          break;
        case "email":
          if (
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
              formData[key]
            )
          )
            errorMsg = "Enter a valid email";
          break;
        case "telephoneNumber":
          if (!/^\d{10}$/.test(formData[key]))
            errorMsg = "Enter a valid 10-digit phone number";
          break;
        case "password":
          if (formData[key].length < 6 || formData[key].length > 20)
            errorMsg = "Password must be 6-20 characters long";
          break;
        case "confirmPassword":
          if (formData[key] !== formData.password)
            errorMsg = "Passwords do not match";
          break;
        case "grade":
          if (!formData[key]) errorMsg = "Grade is required";
          break;
        default:
          break;
      }

      if (errorMsg) {
        newErrors[key] = errorMsg;
        setTimeout(() => {
          setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
        }, 3000);
      }
    });

    if (Object.values(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Validate all fields before submitting

    setLoading(true);

    const response = await dispatch(registerUser(formData));

    if (response.success) {
      setTimeout(() => {
        notification.success({
          message: "Success",
          description: "Successfully created your profile! 🎉",
          placement: "top",
        });
      }, 2000);

      setTimeout(() => navigate("/login"), 3000);
    } else {
      setLoading(false);
      notification.error({
        message: "Error",
        description: response.message,
        placement: "top",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white mb-4">
          Devians - LMS
        </h2>
        <p className="text-center text-gray-500 dark:text-white mb-6">
          Create your account
        </p>

        <form onSubmit={handleSubmit}>
          {[
            { name: "firstName", icon: <FaUser />, placeholder: "First Name" },
            { name: "lastName", icon: <FaUser />, placeholder: "Last Name" },
            {
              name: "email",
              icon: <FaEnvelope />,
              placeholder: "Email",
              type: "email",
            },
            {
              name: "telephoneNumber",
              icon: <FaPhone />,
              placeholder: "Phone Number",
              type: "number",
            },
            {
              name: "password",
              icon: <FaLock />,
              placeholder: "Password",
              type: "password",
            },
            {
              name: "confirmPassword",
              icon: <FaLock />,
              placeholder: "Re-Enter Password",
              type: "password",
            },
          ].map(({ name, icon, placeholder, type = "text" }) => (
            <div key={name} className="mb-4 relative">
              <span className="absolute left-3 top-3 text-gray-500">
                {icon}
              </span>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white ${
                  errors[name] ? "border-red-500" : ""
                }`}
              />
              {errors[name] && (
                <p className="text-red-500 text-sm">{errors[name]}</p>
              )}
            </div>
          ))}

          <div className="mb-4 relative">
            <select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 text-gray-500 ${
                errors.grade ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Grade</option>
              {[
                "Pre-school",
                ...Array.from({ length: 13 }, (_, i) => `Grade ${i + 1}`),
              ].map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            {errors.grade && (
              <p className="text-red-500 text-sm">{errors.grade}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <Spin indicator={<LoadingOutlined />} /> : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 dark:text-blue-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
