import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Switch, Dropdown, Avatar, Tooltip } from "antd";
import {
  CloseOutlined,
  MenuOutlined,
  VideoCameraOutlined,
  StopOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { selectClassState } from "../../redux/features/classes/classSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";
import { fetchClasses } from "../../redux/features/classes/classActions";

const getClassStatus = (classDate, classTime, isCancelled) => {
  if (isCancelled) return { label: "Cancelled", color: "cancelled" };
  const classDateTime = moment(
    `${moment(classDate).format("YYYY-MM-DD")} ${classTime}`,
    "YYYY-MM-DD HH:mm",
  );
  const now = moment();
  const diffMins = classDateTime.diff(now, "minutes");
  if (diffMins > 15) return { label: "Upcoming", color: "upcoming" };
  if (diffMins >= -90 && diffMins <= 15)
    return { label: "Live Now", color: "live" };
  return { label: "Ended", color: "ended" };
};

const canJoinClass = (classDate, classTime, isCancelled) => {
  if (isCancelled) return false;
  const classDateTime = moment(
    `${moment(classDate).format("YYYY-MM-DD")} ${classTime}`,
    "YYYY-MM-DD HH:mm",
  );
  const now = moment();
  const diffMins = classDateTime.diff(now, "minutes");
  return diffMins <= 15 && diffMins >= -90;
};

const year = new Date().getFullYear();

const statusConfig = {
  live: {
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
    badge:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500 animate-ping",
  },
  upcoming: {
    bar: "bg-gradient-to-r from-indigo-500 to-violet-500",
    badge:
      "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    dot: null,
  },
  ended: {
    bar: "bg-gradient-to-r from-slate-400 to-slate-500",
    badge: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
    dot: null,
  },
  cancelled: {
    bar: "bg-gradient-to-r from-rose-500 to-red-600",
    badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    dot: null,
  },
};

const ClassDetails = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const [filteredData, setFilteredData] = useState([]);
  const [, setNow] = useState(moment());

  const history = useNavigate();
  const dispatch = useDispatch();
  const { month, year } = useParams();
  const { user } = useSelector(selectAuthState);
  const { classes } = useSelector(selectClassState);

  useEffect(() => {
    const t = setTimeout(() => setLoader(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(moment()), 60 * 1000);
    return () => clearInterval(interval);
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
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    filterByGradeAndPayment();
  }, [classes, user, month, year]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const filterByGradeAndPayment = () => {
    if (!classes || !user || !month || !year) return;
    const paidMonths =
      user?.membership?.paidMonths?.map((pm) => pm.month.trim()) || [];
    const filtered = classes.filter((item) => {
      const classMonth = moment(item.classDate).format("MMMM").toLowerCase();
      const classYear = String(moment(item.classDate).year());
      const classMonthYear = moment(item.classDate).format("MMMM-YYYY");
      return (
        item.classGrade === user.grade &&
        classMonth === month.toLowerCase() &&
        classYear === String(year) &&
        paidMonths.includes(classMonthYear)
      );
    });
    setFilteredData(filtered);
  };

  const groupClassesByYear = () =>
    filteredData.reduce((acc, cls) => {
      const year = moment(cls.classDate).year();
      if (!acc[year]) acc[year] = [];
      acc[year].push(cls);
      return acc;
    }, {});

  const profileMenu = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[180px]">
      <button
        className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium"
        onClick={() => history(`/user-profile/${user?.firstName}`)}
      >
        👤 Profile
      </button>
      <button
        className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium"
        onClick={() => history(`/user-payments/${user?.firstName}`)}
      >
        📋 My Payments
      </button>
      <button
        className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-medium"
        onClick={() => history(`/user-enroll/${user?.firstName}`)}
      >
        💳 Pay for a Month
      </button>
      <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
      <button
        className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-medium"
        onClick={logoutHandler}
      >
        🚪 Logout
      </button>
    </div>
  );

  if (loader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-poppins text-slate-500 dark:text-slate-400 font-medium">
            Loading classes...
          </p>
        </div>
      </div>
    );
  }

  const grouped = groupClassesByYear();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full glass-nav z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <h1
            className="font-poppins text-xl font-bold gradient-text cursor-pointer"
            onClick={() => history(`/user-dashboard/${user?.firstName}`)}
          >
            Devians ✦ LMS
          </h1>
          <div className="hidden md:flex items-center gap-3">
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
            />
            <button className="text-sm font-medium px-5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
              📚 Classes
            </button>
            <Dropdown
              overlay={profileMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="relative cursor-pointer">
                <Avatar
                  className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold"
                  size={40}
                  src={user?.profilePhoto || undefined}
                >
                  {!user?.profilePhoto &&
                    user?.firstName?.charAt(0).toUpperCase()}
                </Avatar>
                <span
                  className={`absolute -top-0.5 -right-0.5 text-xs leading-none ${user?.membership?.status === "active" ? "text-emerald-500" : "text-amber-500"}`}
                >
                  {user?.membership?.status === "active" ? "✅" : "⏳"}
                </span>
              </div>
            </Dropdown>
          </div>
          <div className="md:hidden">
            <button
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-4 flex flex-col items-center gap-3"
          >
            <button
              className="w-full text-sm text-slate-700 dark:text-slate-300 py-2"
              onClick={() => history(`/user-profile/${user?.firstName}`)}
            >
              👤 Profile
            </button>
            <button
              className="w-full text-sm text-slate-700 dark:text-slate-300 py-2"
              onClick={() => history(`/user-payments/${user?.firstName}`)}
            >
              💳 Payments
            </button>
            <button
              className="w-full text-sm text-rose-600 py-2"
              onClick={logoutHandler}
            >
              🚪 Logout
            </button>
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
            />
          </motion.div>
        )}
      </nav>

      {/* Page header */}
      <div className="pt-24 pb-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-3"
            onClick={() => history(`/user-classes/${user?.firstName}`)}
          >
            ← Back to Months
          </button>
          <h1 className="font-poppins text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 capitalize">
            {month} {year} Classes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            <strong className="text-indigo-600 dark:text-indigo-400">
              {user?.grade}
            </strong>{" "}
            — Join button activates 15 min before class
          </p>
        </motion.div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="font-poppins font-semibold text-xl text-slate-700 dark:text-slate-300 mb-2 capitalize">
              No classes scheduled yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Your payment for <strong className="text-indigo-600 dark:text-indigo-400 capitalize">{month} {year}</strong> is approved.
              Classes for this month haven't been added yet — check back soon.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16 w-full">
          {Object.keys(grouped)
            .sort((a, b) => b - a)
            .map((year) => (
              <div key={year} className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span className="font-poppins font-bold text-lg text-slate-600 dark:text-slate-400">
                    {year}
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {grouped[year].map((classItem, i) => {
                    const status = getClassStatus(
                      classItem.classDate,
                      classItem.classTime,
                      classItem.isCancelled,
                    );
                    const joinable = canJoinClass(
                      classItem.classDate,
                      classItem.classTime,
                      classItem.isCancelled,
                    );
                    const cfg = statusConfig[status.color];

                    return (
                      <motion.div
                        key={classItem._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${!classItem.isCancelled ? "hover:-translate-y-1" : "opacity-75"} border border-slate-200/50 dark:border-slate-700/50`}
                      >
                        {/* Status color bar */}
                        <div className={`h-1.5 ${cfg.bar}`} />

                        {/* Class image */}
                        <div className="relative h-36 overflow-hidden">
                          <img
                            src="https://t3.ftcdn.net/jpg/02/27/26/82/360_F_227268299_liM3oGuQApMjXf23x7rSeFJxLgV6bMcC.jpg"
                            alt={classItem.className}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                          {/* Status badge */}
                          <div className="absolute top-3 right-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge} backdrop-blur-sm`}
                            >
                              {status.color === "live" && (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                              )}
                              {status.label}
                            </span>
                          </div>

                          {/* Class name overlay */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-poppins font-bold text-white text-sm truncate">
                              {classItem.className}
                            </h3>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-4">
                          {classItem.description && (
                            <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 line-clamp-2">
                              {classItem.description}
                            </p>
                          )}

                          <div className="space-y-1.5 mb-4">
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <span>📅</span>
                              <span>
                                {moment(classItem.classDate).format(
                                  "DD MMM YYYY",
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <span>🕐</span>
                              <span>
                                {classItem.classTime
                                  ? moment(classItem.classTime, "HH:mm").format(
                                      "hh:mm A",
                                    )
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <span>🎓</span>
                              <span>{classItem.classGrade}</span>
                            </div>
                          </div>

                          {classItem.notes && (
                            <div className="mb-3 p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 flex gap-2">
                              <FileTextOutlined className="mt-0.5 flex-shrink-0" />
                              <span>{classItem.notes}</span>
                            </div>
                          )}

                          {classItem.isCancelled && (
                            <div className="mb-3 p-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex gap-2">
                              <StopOutlined className="mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>Cancelled</strong>
                                {classItem.cancellationReason
                                  ? `: ${classItem.cancellationReason}`
                                  : ""}
                              </span>
                            </div>
                          )}

                          <Tooltip
                            title={
                              classItem.isCancelled
                                ? "This class has been cancelled"
                                : status.color === "ended"
                                  ? "This class has already ended"
                                  : joinable
                                    ? "Click to join the live class"
                                    : "Join button activates 15 minutes before class"
                            }
                          >
                            <button
                              disabled={!joinable}
                              onClick={() =>
                                window.open(
                                  classItem.classLink,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                              className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                                classItem.isCancelled
                                  ? "bg-rose-50 dark:bg-rose-900/20 text-rose-400 dark:text-rose-500 cursor-not-allowed border border-rose-200 dark:border-rose-800"
                                  : joinable
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-emerald-500/30 hover:-translate-y-0.5 animate-pulse-glow"
                                    : status.color === "ended"
                                      ? "bg-slate-100 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                      : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-400 dark:text-indigo-500 cursor-not-allowed border border-indigo-200 dark:border-indigo-800"
                              }`}
                            >
                              <VideoCameraOutlined />
                              {classItem.isCancelled
                                ? "Cancelled"
                                : joinable
                                  ? "Join Now!"
                                  : status.color === "ended"
                                    ? "Class Ended"
                                    : "Join Class"}
                            </button>
                          </Tooltip>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-950 text-white py-10 px-4 md:px-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="font-poppins font-bold gradient-text mb-1">
              Devians LMS
            </div>
            <p className="text-slate-400 text-sm">
              Premier English Learning Platform
            </p>
          </div>
          <div className="text-slate-400 text-sm">
            <p>📧 support@devians.lms</p>
            <p className="mt-1">
              © {year} Devians LMS Platform 🏛️ All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClassDetails;
