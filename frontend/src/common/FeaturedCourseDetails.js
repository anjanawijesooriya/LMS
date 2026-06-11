import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Dropdown, Avatar } from "antd";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import { selectFeaturedCourses } from "../redux/features/featuredCourses/courseSelectors";
import { getFeaturedCourse } from "../redux/features/featuredCourses/courseActions";
import { selectAuthState } from "../redux/features/auth/authSelectors";
import { logoutUser } from "../redux/features/auth/authActions";

const FeaturedCourseDetails = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [loader, setLoader] = useState(true);

  const history = useNavigate();
  const dispatch = useDispatch();
  const { featuredCourse } = useSelector(selectFeaturedCourses);
  const { isAuthenticated, user } = useSelector(selectAuthState);
  const { id } = useParams();

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
    if (id) dispatch(getFeaturedCourse(id));
  }, [dispatch, id]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const profileMenu = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[160px]">
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => history(`/user-profile/${user?.firstName}`)}>
        👤 Profile
      </button>
      <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => history(`/user-payments/${user?.firstName}`)}>
        💳 Payments
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

      {/* Navbar */}
      <nav className="fixed top-0 w-full glass-nav z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <h1
            className="font-poppins text-xl font-bold gradient-text cursor-pointer select-none"
            onClick={() => isAuthenticated ? history(`/user-dashboard/${user?.firstName}`) : history("/")}
          >
            Devians ✦ LMS
          </h1>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="🌙" unCheckedChildren="☀️" />
            {isAuthenticated ? (
              <>
                <button
                  className={`text-sm font-medium px-5 py-2 rounded-xl transition-all duration-300 ${
                    user?.membership?.status === "active"
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
                      : "btn-primary"
                  }`}
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
                    <Avatar
                      className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold"
                      size={40}
                      src={user?.profilePhoto || undefined}
                    >
                      {!user?.profilePhoto && user?.firstName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <span className={`absolute -top-0.5 -right-0.5 text-xs leading-none ${user?.membership?.status === "active" ? "text-emerald-500" : "text-amber-500"}`}>
                      {user?.membership?.status === "active" ? "✅" : "⏳"}
                    </span>
                  </div>
                </Dropdown>
              </>
            ) : (
              <>
                <button className="btn-outline text-sm" onClick={() => history("/login")}>Login</button>
                <button className="btn-primary text-sm" onClick={() => history("/register")}>Sign Up</button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
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
            {isAuthenticated ? (
              <>
                {user?.membership?.status === "active" ? (
                  <button className="w-full text-sm font-medium px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200" onClick={() => history(`/user-classes/${user?.firstName}`)}>📚 Classes</button>
                ) : (
                  <button className="btn-primary w-full text-sm" onClick={() => history(`/user-enroll/${user?.firstName}`)}>🎓 Enroll</button>
                )}
                <button className="w-full text-sm text-slate-700 dark:text-slate-300 py-2" onClick={() => history(`/user-profile/${user?.firstName}`)}>👤 Profile</button>
                <button className="w-full text-sm text-slate-700 dark:text-slate-300 py-2" onClick={() => history(`/user-payments/${user?.firstName}`)}>💳 Payments</button>
                <button className="w-full text-sm text-rose-600 py-2" onClick={logoutHandler}>🚪 Logout</button>
              </>
            ) : (
              <>
                <button className="btn-outline w-full text-sm" onClick={() => history("/login")}>Login</button>
                <button className="btn-primary w-full text-sm" onClick={() => history("/register")}>Sign Up</button>
              </>
            )}
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="🌙" unCheckedChildren="☀️" />
          </motion.div>
        )}
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center pt-28 pb-16 px-4">

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl mb-6"
        >
          <button
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            onClick={() => history(-1)}
          >
            ← Back to Courses
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            {/* Course image */}
            {featuredCourse?.courseImage && (
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  alt={featuredCourse?.courseName}
                  src={featuredCourse?.courseImage}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs font-medium mb-3">
                    📚 English Course
                  </span>
                  <h2 className="font-poppins text-2xl md:text-3xl font-bold text-white">
                    {featuredCourse?.courseName}
                  </h2>
                </div>
              </div>
            )}

            {/* Course details */}
            <div className="p-6 md:p-8">
              {!featuredCourse?.courseImage && (
                <h2 className="font-poppins text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {featuredCourse?.courseName}
                </h2>
              )}

              {/* Instructor badge */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-poppins font-bold text-lg flex-shrink-0">
                  {featuredCourse?.instructor?.charAt(0) || "I"}
                </div>
                <div>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mb-0.5">Instructor</p>
                  <p className="font-poppins font-semibold text-slate-900 dark:text-white">{featuredCourse?.instructor}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-poppins font-semibold text-slate-900 dark:text-white mb-3">About This Course</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {featuredCourse?.description}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                {isAuthenticated ? (
                  <button
                    className="btn-primary w-full py-3.5 text-sm"
                    onClick={() =>
                      user?.membership?.status === "active"
                        ? history(`/user-classes/${user?.firstName}`)
                        : history(`/user-enroll/${user?.firstName}`)
                    }
                  >
                    {user?.membership?.status === "active" ? "📚 Go to My Classes →" : "🎓 Enroll to Access →"}
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="btn-primary flex-1 py-3.5 text-sm" onClick={() => history("/register")}>
                      Get Started Free →
                    </button>
                    <button className="btn-outline flex-1 py-3.5 text-sm" onClick={() => history("/login")}>
                      Sign In
                    </button>
                  </div>
                )}
              </div>
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
            <p className="mt-1">© 2025 Devians LMS Platform 🏛️ All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturedCourseDetails;
