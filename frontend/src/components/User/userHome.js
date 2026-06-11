import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Rate, Switch, Collapse, Dropdown, Avatar } from "antd";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";
import { selectFeaturedCourses } from "../../redux/features/featuredCourses/courseSelectors";
import { fetchFeaturedCourses } from "../../redux/features/featuredCourses/courseActions";

const { Panel } = Collapse;

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const UserHome = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [loader, setLoader] = useState(true);

  const history = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuthState);
  const { featuredCourses } = useSelector(selectFeaturedCourses);

  const year = new Date().getFullYear();

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
    dispatch(fetchFeaturedCourses());
  }, [dispatch]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const profileMenu = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[160px]">
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
        💳 Payments
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
            onClick={() => history(`/user-dashboard/${user?.firstName}`)}
          >
            Devians ✦ LMS
          </h1>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="🌙" unCheckedChildren="☀️" />
            <button
              className={`text-sm font-medium px-5 py-2 rounded-xl transition-all duration-300 ${
                user?.membership?.status === "active"
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100"
                  : "btn-primary"
              }`}
              onClick={() =>
                user?.membership?.status === "active"
                  ? history(`/user-classes/${user?.firstName}`)
                  : history(`/user-enroll/${user?.firstName}`)
              }
            >
              {user?.membership?.status === "active" ? "📚 My Classes" : "🎓 Enroll Now"}
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
            {user?.membership?.status === "active" ? (
              <button className="w-full text-sm font-medium px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200" onClick={() => history(`/user-classes/${user?.firstName}`)}>📚 My Classes</button>
            ) : (
              <button className="btn-primary w-full text-sm" onClick={() => history(`/user-enroll/${user?.firstName}`)}>🎓 Enroll Now</button>
            )}
            <button className="w-full text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 py-2" onClick={() => history(`/user-profile/${user?.firstName}`)}>👤 Profile</button>
            <button className="w-full text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 py-2" onClick={() => history(`/user-payments/${user?.firstName}`)}>💳 Payments</button>
            <button className="w-full text-sm text-rose-600 hover:text-rose-700 py-2" onClick={logoutHandler}>🚪 Logout</button>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="🌙" unCheckedChildren="☀️" />
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center text-white text-center px-6 overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 pt-16">
        <div className="blob w-80 h-80 bg-indigo-500 top-20 left-10" style={{ animationDelay: "0s" }} />
        <div className="blob w-96 h-96 bg-violet-500 bottom-20 right-10" style={{ animationDelay: "-4s" }} />
        <div className="blob w-64 h-64 bg-purple-400 top-1/2 left-1/2" style={{ animationDelay: "-2s" }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6 text-indigo-200">
            👋 Welcome back, {user?.firstName}!
          </motion.span>

          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-poppins font-bold leading-tight mb-6"
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            Continue Your{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
              English
            </span>{" "}
            Journey
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-indigo-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            {user?.membership?.status === "active"
              ? "Your membership is active. Jump into your live classes and keep learning!"
              : "Your membership is pending. Submit a payment to unlock access to all classes."}
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            {user?.membership?.status === "active" ? (
              <button
                onClick={() => history(`/user-classes/${user?.firstName}`)}
                className="px-8 py-4 bg-white text-indigo-700 font-poppins font-semibold rounded-2xl hover:bg-indigo-50 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:-translate-y-1"
              >
                📚 Go to My Classes →
              </button>
            ) : (
              <button
                onClick={() => history(`/user-enroll/${user?.firstName}`)}
                className="px-8 py-4 bg-white text-indigo-700 font-poppins font-semibold rounded-2xl hover:bg-indigo-50 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:-translate-y-1"
              >
                🎓 Enroll & Pay Now →
              </button>
            )}
          </motion.div>

          {user?.membership?.status === "active" && (
            <motion.div variants={fadeInUp} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-sm">
              ✅ Membership Active — {user?.membership?.paidMonths?.length || 0} month(s) paid
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 py-5"
        >
          <div className="flex justify-center gap-10 md:gap-20">
            {[
              { num: "500+", label: "Active Students" },
              { num: "15+", label: "Courses" },
              { num: "10 yrs", label: "Experience" },
              { num: "100%", label: "Live Classes" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-poppins font-bold text-white">{num}</div>
                <div className="text-xs text-indigo-200 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </header>

      {/* Featured Courses */}
      <motion.section
        className="py-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full"
        initial="hidden"
        whileInView="visible"
        variants={stagger}
        viewport={{ once: true }}
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full mb-3">Our Courses</span>
          <h3 className="section-heading">Featured Courses</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">Explore carefully crafted courses by expert educators.</p>
        </motion.div>
        <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredCourses.map((course, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <div className="card-elevated overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img
                    alt="Course"
                    src={course.courseImage}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-4">
                  <h4 className="font-poppins font-semibold text-slate-900 dark:text-white mb-1">{course.courseName}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{course.instructor}</p>
                  <Rate disabled defaultValue={5} className="text-xs mb-3" />
                  <button
                    className="btn-primary w-full text-sm py-2"
                    onClick={() => history(`/featured-course/${user?.firstName}/${course._id}`)}
                  >
                    View Course
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          className="max-w-7xl mx-auto px-4 md:px-8"
          initial="hidden"
          whileInView="visible"
          variants={stagger}
          viewport={{ once: true }}
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-sm font-medium rounded-full mb-3">Why Us</span>
            <h3 className="section-heading">Why Choose Devians?</h3>
          </motion.div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🏆", title: "Industry-Recognized Learning", desc: "Structured curriculum aligned with academic standards.", gradient: "from-indigo-500 to-blue-500" },
              { icon: "📡", title: "Live Interactive Sessions", desc: "Real-time classes with Q&A and 24/7 support.", gradient: "from-violet-500 to-purple-500" },
              { icon: "🎓", title: "Expert Instructors", desc: "Learn from qualified educators with 10+ years of experience.", gradient: "from-purple-500 to-pink-500" },
            ].map(({ icon, title, desc, gradient }) => (
              <motion.div key={title} variants={fadeInUp} className="card-elevated p-7 text-center group">
                <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
                <h4 className="font-poppins font-semibold text-lg text-slate-900 dark:text-white mb-2">{title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Instructor */}
      <motion.section
        className="py-20 px-4 md:px-8 max-w-3xl mx-auto w-full text-center"
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true }}
      >
        <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full mb-3">Instructor</span>
        <h3 className="section-heading mb-10">Meet Your Instructor</h3>
        <div className="card-elevated p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20" />
          <div className="relative">
            <div className="relative inline-block mb-6">
              <img src="/instructor.jpg" alt="Instructor" className="rounded-full w-32 h-32 mx-auto object-cover ring-4 ring-indigo-200 dark:ring-indigo-700" />
              <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
            </div>
            <h4 className="font-poppins font-bold text-xl text-slate-900 dark:text-white mb-1">Kumuduni Dammika</h4>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-3">Expert English Instructor</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">With 10+ years of teaching experience and a proven track record of student success.</p>
          </div>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        className="py-20 px-4 md:px-8 max-w-3xl mx-auto w-full"
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true }}
      >
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-sm font-medium rounded-full mb-3">Support</span>
          <h3 className="section-heading">Frequently Asked Questions</h3>
        </div>
        <Collapse accordion className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" expandIconPosition="end">
          <Panel header={<span className="font-medium text-slate-800 dark:text-white">How do I join a class?</span>} key="1" className="border-b border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Click on the Classes button in the navbar. The Join button activates 15 minutes before your scheduled class.</p>
          </Panel>
          <Panel header={<span className="font-medium text-slate-800 dark:text-white">Is my membership expiring?</span>} key="2">
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Yes, membership is month-to-month. Submit a payment before month-end to keep access active for the next month.</p>
          </Panel>
        </Collapse>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-950 text-white py-14 px-4 md:px-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="font-poppins font-bold text-xl gradient-text mb-3">Devians LMS</div>
            <p className="text-slate-400 text-sm leading-relaxed">An innovative English learning platform empowering students worldwide.</p>
          </div>
          <div>
            <h4 className="font-poppins font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="hover:text-indigo-400 transition-colors cursor-pointer">Courses</li>
              <li className="hover:text-indigo-400 transition-colors cursor-pointer">Live Classes</li>
              <li className="hover:text-indigo-400 transition-colors cursor-pointer">Enrollment</li>
              <li className="hover:text-indigo-400 transition-colors cursor-pointer">Help Center</li>
            </ul>
          </div>
          <div>
            <h4 className="font-poppins font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-2 text-slate-400 text-sm">
              <p>📧 support@devians.lms</p>
              <p>📞 +94 77 123 4567</p>
            </div>
          </div>
          <div>
            <h4 className="font-poppins font-semibold text-white mb-4">Legal</h4>
            <p className="text-slate-400 text-sm">© {year} Devians LMS Platform 🏛️<br />All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserHome;
