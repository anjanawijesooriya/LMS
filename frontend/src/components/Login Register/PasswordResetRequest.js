import { Modal, Spin, notification } from "antd";
import React, { useState } from "react";
import { LoadingOutlined, MailOutlined } from "@ant-design/icons";
import axiosInstance from "../../utils/axiosInstance";
const axios = axiosInstance;

const ForgotPassword = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const forgotPasswordHandler = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const config = { headers: { "Content-Type": "application/json" } };

    try {
      const { data } = await axios.post(
        "http://localhost:8071/api/auth/forgotpassword",
        { email },
        config
      );
      setSuccess(data.verify || "Reset email sent!");
      setTimeout(() => {
        notification.success({
          message: "Email Sent",
          description: "Check your inbox for the password reset link.",
          placement: "topRight",
        });
        setLoading(false);
        setVisible(false);
        setEmail("");
        setSuccess("");
      }, 2500);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No account found with this email address.");
      } else {
        setError(err.response?.data?.error || "Something went wrong. Please try again.");
      }
      setTimeout(() => {
        setLoading(false);
        setError("");
      }, 3000);
    }
  };

  return (
    <>
      <button
        type="button"
        className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline font-medium"
        onClick={() => { setVisible(true); setEmail(""); setError(""); setSuccess(""); }}
      >
        Forgot password?
      </button>

      <Modal
        open={visible}
        onCancel={() => { if (!loading) setVisible(false); }}
        footer={null}
        centered
        closable={!loading}
        width={440}
        styles={{ content: { borderRadius: "1.5rem", padding: 0, overflow: "hidden" } }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <MailOutlined className="text-white text-xl" />
          </div>
          <h2 className="font-poppins font-bold text-white text-xl">Reset your password</h2>
          <p className="text-indigo-200 text-sm mt-1">
            Enter your account email and we'll send a reset link.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm mb-4">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm mb-4">
              ✅ {success}
            </div>
          )}

          <form onSubmit={forgotPasswordHandler} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Email address</label>
              <div className="relative">
                <MailOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Spin indicator={<LoadingOutlined style={{ color: "white", fontSize: 16 }} />} /> : "Send Reset Link"}
              </button>
              <button
                type="button"
                disabled={loading}
                className="px-5 py-3 border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-300 text-sm disabled:opacity-60"
                onClick={() => setVisible(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default ForgotPassword;
