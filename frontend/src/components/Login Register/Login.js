import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notification, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaEnvelope } from "react-icons/fa";

import PasswordResetRequest from "./PasswordResetRequest";
import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { loginUser } from "../../redux/features/auth/authActions";

const Login = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const history = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(selectAuthState);

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
  }, [isAuthenticated, user, history]);

  const validateEmail = (email) =>
    /^[\w-.]+@[\w-]+\.[a-z]{2,}$/.test(email);

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
    setLoading(true);
    const response = await dispatch(loginUser({ email, password }));
    if (response.success) {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    } else {
      setLoading(false);
      notification.error({
        message: "Login Failed",
        description: response.message,
        placement: "topRight",
      });
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 flex-col items-center justify-center p-12">
        {/* Blobs */}
        <div className="blob w-72 h-72 bg-indigo-500 top-10 left-10" />
        <div className="blob w-80 h-80 bg-violet-500 bottom-10 right-10" style={{ animationDelay: "-3s" }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <motion.div
          className="relative z-10 text-white text-center max-w-md"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="font-poppins text-3xl font-bold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent mb-2 cursor-pointer"
            onClick={() => history("/")}
          >
            Devians ✦ LMS
          </div>
          <p className="text-indigo-200 text-sm mb-12">Premier English Learning Platform</p>

          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-8xl mb-8"
          >
            🎓
          </motion.div>

          <h2 className="text-3xl font-poppins font-bold mb-4 leading-tight">
            Welcome Back to Your Learning Journey
          </h2>
          <p className="text-indigo-200 leading-relaxed text-sm">
            Continue mastering English with live classes, expert guidance, and a community of learners just like you.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[{ n: "500+", l: "Students" }, { n: "10yr", l: "Experience" }, { n: "4.9★", l: "Rating" }].map(({ n, l }) => (
              <div key={l} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="font-poppins font-bold text-xl text-white">{n}</div>
                <div className="text-indigo-300 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile logo */}
          <div
            className="lg:hidden font-poppins text-2xl font-bold gradient-text text-center mb-8 cursor-pointer"
            onClick={() => history("/")}
          >
            Devians ✦ LMS
          </div>

          <div className="mb-8">
            <h2 className="font-poppins text-3xl font-bold text-slate-900 dark:text-white mb-2">Sign in</h2>
            <p className="text-slate-500 dark:text-slate-400">Welcome back! Enter your credentials to continue.</p>
          </div>

          <form onSubmit={loginHandler} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-xl text-rose-600 dark:text-rose-400 text-sm"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all text-sm"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              {password.length > 0 && !isValid && (
                <p className="text-rose-500 text-xs mt-1">Password must be 6–20 characters.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-poppins font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Spin indicator={<LoadingOutlined style={{ color: "white" }} />} /> : "Sign In →"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <div className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline text-sm">
              <PasswordResetRequest />
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Sign Up
              </Link>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
