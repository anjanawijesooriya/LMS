import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Switch, Dropdown, Avatar, Tag, Table } from "antd";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";
import { fetchPayments } from "../../redux/features/payments/paymentActions";
import { selectPayments } from "../../redux/features/payments/paymentSelectors";

const Payments = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [filteredData, setFilteredData] = useState([]);

  const history = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuthState);
  const { payments } = useSelector(selectPayments);
  const currentYear = new Date().getFullYear();

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
    dispatch(fetchPayments());
  }, [dispatch]);

  useEffect(() => {
    if (!payments) return;
    setFilteredData(payments.filter((p) => p.studentId === user.studentId));
  }, [payments]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const profileMenu = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[160px]">
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => history(`/user-profile/${user?.firstName}`)}>👤 Profile</button>
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => history(`/user-payments/${user?.firstName}`)}>💳 Payments</button>
      <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-medium" onClick={logoutHandler}>🚪 Logout</button>
    </div>
  );

  const columns = [
    {
      title: "Name",
      render: (_, r) => <span className="font-medium">{r.firstName} {r.lastName}</span>,
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
      render: (v) => <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">{v}</span>,
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      filters: ["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => ({ text: m, value: m })),
      onFilter: (value, record) => record.month === value,
    },
    { title: "Year", dataIndex: "year", key: "year" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (v) => <span className="font-semibold text-indigo-600 dark:text-indigo-400">Rs. {v?.toLocaleString()}</span>,
    },
    { title: "Remarks", dataIndex: "remarks", key: "remarks", render: (v) => v || <span className="text-slate-400">—</span> },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [{ text: "Approved", value: "approved" }, { text: "Pending", value: "pending" }, { text: "Rejected", value: "rejected" }],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const colors = { approved: "green", pending: "gold", rejected: "red" };
        return (
          <Tag color={colors[record.status] || "default"} className="rounded-full font-medium">
            {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
          </Tag>
        );
      },
    },
  ];

  if (loader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-poppins text-slate-500 dark:text-slate-400 font-medium">Loading payments...</p>
        </div>
      </div>
    );
  }

  const approved = filteredData.filter((p) => p.status === "approved");
  const pending = filteredData.filter((p) => p.status === "pending");
  const totalPaid = approved.reduce((sum, p) => sum + (p.amount || 0), 0);

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
              className={`text-sm font-medium px-5 py-2 rounded-xl transition-all duration-300 ${user?.membership?.status === "active" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700" : "btn-primary"}`}
              onClick={() => user?.membership?.status === "active" ? history(`/user-classes/${user?.firstName}`) : history(`/user-enroll/${user?.firstName}`)}
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
            <button className="w-full text-sm text-slate-700 dark:text-slate-300 py-2" onClick={() => history(`/user-profile/${user?.firstName}`)}>👤 Profile</button>
            <button className="w-full text-sm text-slate-700 dark:text-slate-300 py-2" onClick={() => history(`/user-payments/${user?.firstName}`)}>💳 Payments</button>
            <button className="w-full text-sm text-rose-600 py-2" onClick={logoutHandler}>🚪 Logout</button>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="🌙" unCheckedChildren="☀️" />
          </motion.div>
        )}
      </nav>

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full mb-3">Billing</span>
          <h1 className="font-poppins text-3xl font-bold text-slate-900 dark:text-white mb-1">Payment History</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Track all your payment submissions and their approval status.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: "Total Paid", value: `Rs. ${totalPaid.toLocaleString()}`, icon: "💰", color: "from-emerald-500 to-teal-500" },
            { label: "Approved", value: approved.length, icon: "✅", color: "from-indigo-500 to-violet-500" },
            { label: "Pending Review", value: pending.length, icon: "⏳", color: "from-amber-500 to-orange-500" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{icon}</div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
                <p className="font-poppins font-bold text-xl text-slate-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-poppins font-semibold text-slate-900 dark:text-white">All Transactions</h3>
          </div>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            bordered={false}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: "max-content" }}
            className="payment-table"
          />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-950 text-white py-10 px-4 md:px-8 mt-auto border-t border-slate-800">
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

export default Payments;
