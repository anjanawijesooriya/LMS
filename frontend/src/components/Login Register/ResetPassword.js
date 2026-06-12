import React, { useEffect, useState } from "react";
import { notification, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
const axios = axiosInstance;

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { resetToken } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setLoader(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setIsValid(value.length >= 6 && value.length <= 20);
  };

  const resetPasswordHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notification.error({ message: "Passwords do not match", placement: "topRight" });
      return;
    }
    setLoading(true);
    try {
      await axios.put(`/api/auth/passwordreset/${resetToken}`, { password });
      notification.success({
        message: "Password Reset Successful",
        description: "You can now log in with your new password.",
        placement: "topRight",
      });
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (error) {
      notification.error({
        message: "Reset Failed",
        description: error.response?.data?.message || "Something went wrong.",
        placement: "topRight",
      });
      setLoading(false);
    }
  };

  if (!loader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-poppins text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 flex-col items-center justify-center p-12">
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
            onClick={() => navigate("/")}
          >
            Devians ✦ LMS
          </div>
          <p className="text-indigo-200 text-sm mb-12">Premier English Learning Platform</p>

          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-8xl mb-8"
          >
            🔐
          </motion.div>

          <h2 className="text-3xl font-poppins font-bold mb-4 leading-tight">
            Create a Strong New Password
          </h2>
          <p className="text-indigo-200 leading-relaxed text-sm">
            Choose a password that's at least 6 characters. We recommend mixing letters, numbers, and symbols.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { icon: "🔒", label: "Secure" },
              { icon: "⚡", label: "Fast Reset" },
              { icon: "✅", label: "Protected" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-indigo-200 text-xs">{label}</div>
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
            onClick={() => navigate("/")}
          >
            Devians ✦ LMS
          </div>

          <div className="mb-8">
            <h2 className="font-poppins text-3xl font-bold text-slate-900 dark:text-white mb-2">Set new password</h2>
            <p className="text-slate-500 dark:text-slate-400">Enter and confirm your new password below.</p>
          </div>

          <form onSubmit={resetPasswordHandler} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full pl-11 pr-14 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all text-sm"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              {password.length > 0 && !isValid && (
                <p className="text-rose-500 text-xs mt-1">Password must be 6–20 characters.</p>
              )}
              {isValid && (
                <p className="text-emerald-500 text-xs mt-1">✓ Password strength looks good.</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <p className="text-rose-500 text-xs mt-1">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || loading || confirmPassword !== password}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-poppins font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Spin indicator={<LoadingOutlined style={{ color: "white" }} />} /> : "Reset Password →"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
              onClick={() => navigate("/login")}
            >
              ← Back to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
