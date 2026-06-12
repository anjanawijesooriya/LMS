import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Input, Switch, Dropdown, Avatar, Form, Select, notification, Upload,
} from "antd";
import { CloseOutlined, MenuOutlined, UploadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";
import { addPayment } from "../../redux/features/payments/paymentActions";
import axiosInstance from "../../utils/axiosInstance";
const axios = axiosInstance;

const { Option } = Select;

const Enroll = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [loading, setLoading] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipUrl, setSlipUrl] = useState(null);

  const history = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuthState);
  const [form] = Form.useForm();
  const currentYear = new Date().getFullYear();
  // Allow current year and the two previous years
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  useEffect(() => {
    const t = setTimeout(() => setLoader(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    form.setFieldsValue({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      studentId: user?.studentId || "",
      year: currentYear,
    });
  }, [user, form]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const handleSlipUpload = async (file) => {
    setUploadingSlip(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/upload?folder=payment-slips", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setSlipUrl(res.data.url);
        setSlipFile(file);
        notification.success({ message: "Slip uploaded successfully" });
      }
    } catch {
      notification.error({ message: "Failed to upload slip. Please try again." });
    } finally {
      setUploadingSlip(false);
    }
    return false;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const { firstName, lastName, studentId, amount, month, year, remarks } = values;
      const requestData = {
        firstName, lastName, studentId,
        amount: Number(amount),
        month,
        year: Number(year),
        remarks: remarks || "",
        slipImage: slipUrl || null,
      };
      const response = await dispatch(addPayment(requestData));
      if (response.success) {
        notification.success({
          message: "Payment Submitted",
          description: "Your payment details have been submitted. Awaiting admin approval.",
          placement: "topRight",
        });
        form.resetFields(["amount", "month", "remarks"]);
        setSlipFile(null);
        setSlipUrl(null);
      } else {
        notification.error({
          message: "Error",
          description: response.message || "Failed to submit payment.",
          placement: "topRight",
        });
      }
    } catch {
      // form validation error
    } finally {
      setLoading(false);
    }
  };

  const profileMenu = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[160px]">
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => history(`/user-profile/${user?.firstName}`)}>👤 Profile</button>
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => history(`/user-payments/${user?.firstName}`)}>💳 Payments</button>
      <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-medium" onClick={logoutHandler}>🚪 Logout</button>
    </div>
  );

  if (loader) {
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

      {/* Navbar */}
      <nav className="fixed top-0 w-full glass-nav z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <h1 className="font-poppins text-xl font-bold gradient-text cursor-pointer" onClick={() => history(`/user-dashboard/${user?.firstName}`)}>
            Devians ✦ LMS
          </h1>
          <div className="hidden md:flex items-center gap-3">
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="🌙" unCheckedChildren="☀️" />
            <button
              className="btn-primary text-sm"
              onClick={() =>
                user?.membership?.status === "active"
                  ? history(`/user-classes/${user?.firstName}`)
                  : history(`/user-enroll/${user?.firstName}`)
              }
            >
              {user?.membership?.status === "active" ? "📚 Classes" : "🎓 Enroll"}
            </button>
            <Dropdown overlay={profileMenu} trigger={["click"]} placement="bottomRight">
              <div className="relative cursor-pointer">
                <Avatar className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold" size={40} src={user?.profilePhoto || undefined}>
                  {!user?.profilePhoto && user?.firstName?.charAt(0).toUpperCase()}
                </Avatar>
                <span className={`absolute -top-0.5 -right-0.5 text-xs leading-none ${user?.membership?.status === "active" ? "text-emerald-500" : "text-amber-500"}`}>
                  {user?.membership?.status === "active" ? "✅" : "⏳"}
                </span>
              </div>
            </Dropdown>
          </div>
          <div className="md:hidden">
            <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-4 flex flex-col items-center gap-3">
            <button className="btn-primary w-full text-sm" onClick={() => history(`/user-enroll/${user?.firstName}`)}>🎓 Enroll</button>
            <button className="w-full text-sm text-slate-700 dark:text-slate-300 py-2" onClick={() => history(`/user-profile/${user?.firstName}`)}>👤 Profile</button>
            <button className="w-full text-sm text-slate-700 dark:text-slate-300 py-2" onClick={() => history(`/user-payments/${user?.firstName}`)}>💳 Payments</button>
            <button className="w-full text-sm text-rose-600 py-2" onClick={logoutHandler}>🚪 Logout</button>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="🌙" unCheckedChildren="☀️" />
          </motion.div>
        )}
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          {/* Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            {/* Gradient header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white text-center relative overflow-hidden">
              <div className="blob w-32 h-32 bg-white/10 top-0 right-0" />
              <div className="relative z-10">
                <div className="text-4xl mb-3">💳</div>
                <h2 className="font-poppins text-2xl font-bold">Submit Payment</h2>
                <p className="text-indigo-100 text-sm mt-1">Fill in your payment details for admin review</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <Form layout="vertical" form={form}>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item label={<span className="text-slate-600 dark:text-slate-300 text-sm font-medium">First Name</span>} name="firstName">
                    <Input disabled className="rounded-xl" />
                  </Form.Item>
                  <Form.Item label={<span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Last Name</span>} name="lastName">
                    <Input disabled className="rounded-xl" />
                  </Form.Item>
                </div>

                <Form.Item label={<span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Student ID</span>} name="studentId">
                  <Input disabled className="rounded-xl" />
                </Form.Item>

                <div className="grid grid-cols-3 gap-4">
                  <Form.Item
                    label={<span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Amount (Rs.)</span>}
                    name="amount"
                    rules={[{ required: true, message: "Enter amount" }]}
                  >
                    <Input type="number" min={1} placeholder="e.g. 2500" className="rounded-xl" />
                  </Form.Item>
                  <Form.Item
                    label={<span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Month</span>}
                    name="month"
                    rules={[{ required: true, message: "Select month" }]}
                  >
                    <Select placeholder="Select Month" className="rounded-xl">
                      {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
                        <Option key={m} value={m}>{m}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={<span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Year</span>}
                    name="year"
                    rules={[{ required: true, message: "Select year" }]}
                  >
                    <Select className="rounded-xl">
                      {yearOptions.map((y) => (
                        <Option key={y} value={y}>{y}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item label={<span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Remarks (optional)</span>} name="remarks">
                  <Input.TextArea placeholder="Any notes for the admin..." rows={2} className="rounded-xl" />
                </Form.Item>

                <Form.Item label={<span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Payment Slip (optional)</span>}>
                  <Upload
                    beforeUpload={handleSlipUpload}
                    showUploadList={slipFile ? [{ name: slipFile.name, status: "done" }] : false}
                    maxCount={1}
                    accept="image/*"
                  >
                    <button
                      type="button"
                      className="w-full border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl py-4 px-4 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm"
                    >
                      {uploadingSlip ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <UploadOutlined />
                      )}
                      {slipFile ? "Change Payment Slip" : "Upload Payment Slip"}
                    </button>
                  </Upload>
                  {slipUrl && (
                    <div className="mt-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                      <span>✅</span> Slip uploaded successfully
                    </div>
                  )}
                </Form.Item>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || uploadingSlip}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-poppins font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <span className="animate-spin">⏳</span> : "Submit Payment →"}
                </button>
              </Form>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-950 text-white py-10 px-4 md:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="font-poppins font-bold gradient-text mb-1">Devians LMS</div>
            <p className="text-slate-400 text-sm">Premier English Learning Platform</p>
          </div>
          <div className="text-slate-400 text-sm">
            <p>📧 support@devians.lms</p>
            <p className="mt-1">© {currentYear} Devians LMS Platform 🏛️ All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Enroll;
