import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Switch, Dropdown, Avatar } from "antd";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const monthGradients = [
  "from-blue-500 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-500 to-blue-600",
  "from-lime-500 to-green-600",
  "from-amber-500 to-orange-600",
  "from-orange-500 to-red-600",
  "from-purple-500 to-violet-600",
  "from-indigo-500 to-blue-700",
  "from-red-500 to-rose-700",
  "from-yellow-600 to-amber-700",
  "from-blue-700 to-indigo-900",
];

const monthIcons = ["❄️","💝","🌸","🌿","🌻","☀️","🏖️","🎒","🍂","🎃","🍁","🎄"];

const Classes = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const history = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuthState);

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

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const profileMenu = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[180px]">
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => history(`/user-profile/${user?.firstName}`)}>
        👤 Profile
      </button>
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => history(`/user-payments/${user?.firstName}`)}>
        📋 My Payments
      </button>
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-medium" onClick={() => history(`/user-enroll/${user?.firstName}`)}>
        💳 Pay for a Month
      </button>
      <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-medium" onClick={logoutHandler}>
        🚪 Logout
      </button>
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

  const currentMonthIndex = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // All paid month strings e.g. ["June-2025", "April-2026"]
  const paidMonths = user?.membership?.paidMonths?.map((pm) => pm.month.trim()) || [];

  // Collect all unique years from paidMonths, always include current year
  const paidYears = paidMonths.map((pm) => {
    const parts = pm.split("-");
    return Number(parts[parts.length - 1]);
  });
  const allYears = [...new Set([currentYear, ...paidYears])].sort((a, b) => b - a);

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
            <button className="text-sm font-medium px-5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
              📚 Classes
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
            <button className="w-full text-sm text-slate-700 dark:text-slate-300 py-2" onClick={() => history(`/user-payments/${user?.firstName}`)}>📋 My Payments</button>
            <button className="w-full text-sm text-amber-600 dark:text-amber-400 py-2" onClick={() => history(`/user-enroll/${user?.firstName}`)}>💳 Pay for a Month</button>
            <button className="w-full text-sm text-rose-600 py-2" onClick={logoutHandler}>🚪 Logout</button>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="🌙" unCheckedChildren="☀️" />
          </motion.div>
        )}
      </nav>

      {/* Page header */}
      <div className="pt-24 pb-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-poppins text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Choose a Month
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            <strong className="text-indigo-600 dark:text-indigo-400">{user?.grade}</strong> — Select a paid month to view its classes
          </p>
        </motion.div>
      </div>

      {/* Year sections */}
      <div className="px-4 md:px-8 pb-16 max-w-7xl mx-auto w-full space-y-12">
        {allYears.map((year) => {
          const isPastYear = year < currentYear;

          return (
            <div key={year}>
              {/* Year divider */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-6"
              >
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="font-poppins font-bold text-xl text-slate-700 dark:text-slate-300">{year}</span>
                  {year === currentYear && (
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
                      Current
                    </span>
                  )}
                  {isPastYear && (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full font-medium">
                      Past
                    </span>
                  )}
                </div>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </motion.div>

              {/* Month grid for this year */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {months.map((month, index) => {
                  const monthYear = `${month.trim()}-${year}`;
                  // Future only applies to current year — past years have no future months
                  const isFutureMonth = year === currentYear && index > currentMonthIndex;
                  const isPaidMonth = paidMonths.some(
                    (pm) => pm.toLowerCase() === monthYear.toLowerCase()
                  );

                  const isAccessible = isPaidMonth && !isFutureMonth;
                  const isUnpaidPast = !isPaidMonth && !isFutureMonth;

                  return (
                    <motion.div
                      key={`${year}-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={`relative h-36 rounded-2xl overflow-hidden transition-all duration-300 ${
                        isAccessible
                          ? "cursor-pointer hover:scale-105 hover:shadow-2xl animate-pulse-glow"
                          : isUnpaidPast
                          ? "cursor-pointer hover:scale-105 hover:shadow-xl"
                          : "opacity-35 grayscale cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (isAccessible) history(`/classes/${user?.firstName}/${year}/${month.toLowerCase()}`);
                        if (isUnpaidPast) history(`/user-enroll/${user?.firstName}`);
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${monthGradients[index]}`} />
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />

                      {isUnpaidPast && (
                        <div className="absolute inset-0 bg-black/45" />
                      )}

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <span className="text-3xl mb-1">{monthIcons[index]}</span>
                        <span className="font-poppins font-bold text-base">{month}</span>

                        {isAccessible && (
                          <span className="mt-1 text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium">
                            Paid ✓
                          </span>
                        )}
                        {isUnpaidPast && (
                          <span className="mt-2 text-xs bg-amber-400/90 text-amber-900 font-semibold px-3 py-1 rounded-full">
                            💳 Pay Now
                          </span>
                        )}
                        {isFutureMonth && (
                          <span className="mt-1 text-xl">🔒</span>
                        )}
                      </div>

                      {isAccessible && (
                        <div className="absolute inset-0 rounded-2xl ring-2 ring-white/30" />
                      )}
                      {isUnpaidPast && (
                        <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-300/70" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-5 text-xs text-slate-400 dark:text-slate-500"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            Paid — click to view classes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Unpaid — click to submit payment
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
            Future — not available yet
          </span>
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

export default Classes;
