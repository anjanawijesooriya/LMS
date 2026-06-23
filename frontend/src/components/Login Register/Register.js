import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FaUser, FaLock, FaEnvelope, FaPhone } from "react-icons/fa";
import { notification, Spin } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      let errorMsg = "";
      switch (key) {
        case "firstName":
          if (!formData[key].trim()) errorMsg = "First Name is required";
          break;
        case "lastName":
          if (!formData[key].trim()) errorMsg = "Last Name is required";
          break;
        case "email":
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData[key]))
            errorMsg = "Enter a valid email";
          break;
        case "telephoneNumber":
          if (!/^\d{10}$/.test(formData[key]))
            errorMsg = "Enter a valid 10-digit phone number";
          break;
        case "password":
          if (formData[key].length < 6 || formData[key].length > 20)
            errorMsg = "Password must be 6–20 characters";
          break;
        case "confirmPassword":
          if (formData[key] !== formData.password) errorMsg = "Passwords do not match";
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
          setErrors((prev) => ({ ...prev, [key]: "" }));
        }, 3000);
      }
    });

    if (Object.values(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const response = await dispatch(registerUser(formData));
    if (response.success) {
      setTimeout(() => {
        notification.success({
          message: "Account Created!",
          description: "Your profile has been created successfully! 🎉",
          placement: "topRight",
        });
      }, 2000);
      setTimeout(() => navigate("/login"), 3000);
    } else {
      setLoading(false);
      notification.error({
        message: "Registration Failed",
        description: response.message,
        placement: "topRight",
      });
    }
  };

  const fields = [
    { name: "firstName", icon: <FaUser />, placeholder: "First Name" },
    { name: "lastName", icon: <FaUser />, placeholder: "Last Name" },
    { name: "email", icon: <FaEnvelope />, placeholder: "Email Address", type: "email" },
    { name: "telephoneNumber", icon: <FaPhone />, placeholder: "Phone Number (10 digits)", type: "number" },
    { name: "password", icon: <FaLock />, placeholder: "Password (6–20 chars)", type: "password" },
    { name: "confirmPassword", icon: <FaLock />, placeholder: "Confirm Password", type: "password" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-900 to-blue-900 flex-col items-center justify-center p-12">
        <div className="blob w-72 h-72 bg-violet-500 top-10 left-10" />
        <div className="blob w-80 h-80 bg-indigo-500 bottom-10 right-10" style={{ animationDelay: "-3s" }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <motion.div
          className="relative z-10 text-white text-center max-w-md"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="font-poppins text-3xl font-bold bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent mb-2">
            Devians ✦ LMS
          </div>
          <p className="text-indigo-200 text-sm mb-10">Premier English Learning Platform</p>

          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-7xl mb-8"
          >
            ✨
          </motion.div>

          <h2 className="text-2xl font-poppins font-bold mb-3 leading-tight">
            Start Your English Learning Journey Today
          </h2>
          <p className="text-indigo-200 leading-relaxed text-sm">
            Create your account in minutes and gain access to live classes, expert instruction, and a thriving learning community.
          </p>

          <div className="mt-8 space-y-3">
            {["✅ Instant account creation", "🎓 Access to all grade levels", "📅 Monthly flexible membership", "📡 Live interactive sessions"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-left">
                <span className="text-sm text-indigo-100">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lg:hidden font-poppins text-2xl font-bold gradient-text text-center mb-6 cursor-pointer" onClick={() => navigate("/")}>
            Devians ✦ LMS
          </div>

          <div className="mb-7">
            <h2 className="font-poppins text-3xl font-bold text-slate-900 dark:text-white mb-2">Create account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Fill in your details to get started for free.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.slice(0, 2).map(({ name, icon, placeholder, type = "text" }) => (
                <div key={name}>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{placeholder}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>
                    <input
                      type={type}
                      name={name}
                      placeholder={placeholder}
                      value={formData[name]}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all text-sm ${errors[name] ? "border-rose-400" : "border-slate-200 dark:border-slate-700"}`}
                    />
                  </div>
                  {errors[name] && <p className="text-rose-500 text-xs mt-1">{errors[name]}</p>}
                </div>
              ))}
            </div>

            {fields.slice(2).map(({ name, icon, placeholder, type = "text" }) => (
              <div key={name}>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{placeholder}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all text-sm ${errors[name] ? "border-rose-400" : "border-slate-200 dark:border-slate-700"}`}
                  />
                </div>
                {errors[name] && <p className="text-rose-500 text-xs mt-1">{errors[name]}</p>}
              </div>
            ))}

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Grade / Year</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all text-sm ${errors.grade ? "border-rose-400" : "border-slate-200 dark:border-slate-700"}`}
              >
                <option value="">Select your grade</option>
                {["Pre-school", ...Array.from({ length: 13 }, (_, i) => `Grade ${i + 1}`)].map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {errors.grade && <p className="text-rose-500 text-xs mt-1">{errors.grade}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-poppins font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Spin indicator={<LoadingOutlined style={{ color: "white" }} />} /> : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
