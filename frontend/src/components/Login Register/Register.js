import React, { useState } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { notification, Spin } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateField = (name, value) => {
    let errorMsg = "";

    switch (name) {
      case "firstName":
        if (!value.trim()) errorMsg = "First Name is required";
        break;
      case "lastName":
        if (!value.trim()) errorMsg = "Last Name is required";
        break;
      case "email":
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
          errorMsg = "Enter a valid email";
        break;
      case "password":
        if (value.length < 6 || value.length > 20)
          errorMsg = "Password must be 6-20 characters long";
        break;
      case "confirmPassword":
        if (value !== formData.password) errorMsg = "Passwords do not match";
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submitting
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
      if (!formData[key]) newErrors[key] = `${key} is required`;
    });

    if (Object.values(newErrors).some((err) => err)) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    if (password !== confirmPassword) {
      //method for cheking the password an confirm password
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
      setTimeout(() => {
        setErrors("");
      }, 5000);

      return setErrors("Password did not match");
    }

    try {
      const { data } = await axios.post(
        "/api/auth/register",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      notification.success({
        message: "Success",
        description: "Successfully created your profile! 🎉",
        placement: "top",
      });

      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.response?.data?.message || "Something went wrong",
        placement: "top",
      });
      setLoading(false);
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
                onBlur={handleBlur}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white ${
                  errors[name] ? "border-red-500" : ""
                }`}
              />
              {errors[name] && (
                <p className="text-red-500 text-sm">{errors[name]}</p>
              )}
            </div>
          ))}

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
          <Link to="/" className="text-blue-600 dark:text-blue-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
