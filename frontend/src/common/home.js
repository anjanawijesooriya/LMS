import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Rate, Switch, Collapse } from "antd";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { fetchFeaturedCourses } from "../redux/features/featuredCourses/courseActions";
import { selectFeaturedCourses } from "../redux/features/featuredCourses/courseSelectors";

const { Panel } = Collapse;

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [loader, setLoader] = useState(true);

  const history = useNavigate();
  const dispatch = useDispatch();
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
            onClick={() => history("/")}
          >
            Devians ✦ LMS
          </h1>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
            />
            <button
              className="btn-outline text-sm"
              onClick={() => history("/login")}
            >
              Login
            </button>
            <button
              className="btn-primary text-sm"
              onClick={() => history("/register")}
            >
              Sign Up
            </button>
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

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-4 flex flex-col items-center gap-3"
          >
            <button className="btn-outline w-full text-sm" onClick={() => history("/login")}>Login</button>
            <button className="btn-primary w-full text-sm" onClick={() => history("/register")}>Sign Up</button>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="🌙" unCheckedChildren="☀️" />
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center text-white text-center px-6 overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 pt-16">
        {/* Animated background blobs */}
        <div className="blob w-80 h-80 bg-indigo-500 top-20 left-10" style={{ animationDelay: "0s" }} />
        <div className="blob w-96 h-96 bg-violet-500 bottom-20 right-10" style={{ animationDelay: "-4s" }} />
        <div className="blob w-64 h-64 bg-purple-400 top-1/2 left-1/2" style={{ animationDelay: "-2s" }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6 text-indigo-200"
          >
            🎓 Premier English Learning Platform
          </motion.span>

          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-poppins font-bold leading-tight mb-6"
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            Unlock Your{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
              English
            </span>{" "}
            Potential
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-indigo-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students learning with expert guidance, live interactive sessions, and structured courses designed for every grade.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => history("/register")}
              className="px-8 py-4 bg-white text-indigo-700 font-poppins font-semibold rounded-2xl hover:bg-indigo-50 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:-translate-y-1"
            >
              Get Started Free →
            </button>
            <button
              onClick={() => history("/login")}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-poppins font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300"
            >
              Sign In
            </button>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
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
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">Explore carefully crafted courses by expert educators to accelerate your English learning journey.</p>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
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
                  <h4 className="font-poppins font-semibold text-slate-900 dark:text-white mb-1">
                    {course.courseName}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{course.instructor}</p>
                  <Rate disabled defaultValue={5} className="text-xs mb-3" />
                  <button
                    className="btn-primary w-full text-sm py-2"
                    onClick={() => history(`/featured-course/${course._id}`)}
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
              {
                icon: "🏆",
                title: "Industry-Recognized Learning",
                desc: "Structured curriculum aligned with academic standards to boost your career and exam results.",
                gradient: "from-indigo-500 to-blue-500",
              },
              {
                icon: "📡",
                title: "Live Interactive Sessions",
                desc: "Real-time classes with Q&A, recordings, and 24/7 support so you never fall behind.",
                gradient: "from-violet-500 to-purple-500",
              },
              {
                icon: "🎓",
                title: "Expert Instructors",
                desc: "Learn from qualified educators with 10+ years of experience guiding students to success.",
                gradient: "from-purple-500 to-pink-500",
              },
            ].map(({ icon, title, desc, gradient }) => (
              <motion.div
                key={title}
                variants={fadeInUp}
                className="card-elevated p-7 text-center group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {icon}
                </div>
                <h4 className="font-poppins font-semibold text-lg text-slate-900 dark:text-white mb-2">{title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Instructor Showcase */}
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
              <img
                src="/instructor.jpg"
                alt="Instructor"
                className="rounded-full w-32 h-32 mx-auto object-cover ring-4 ring-indigo-200 dark:ring-indigo-700"
              />
              <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
            </div>
            <h4 className="font-poppins font-bold text-xl text-slate-900 dark:text-white mb-1">Kumuduni Dammika</h4>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-3">Expert English Instructor</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
              With 10+ years of teaching experience, Kumuduni brings energy, expertise and a proven track record of student success.
            </p>
            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center"><div className="font-poppins font-bold text-xl text-indigo-600">10+</div><div className="text-xs text-slate-500">Years Exp.</div></div>
              <div className="text-center"><div className="font-poppins font-bold text-xl text-indigo-600">500+</div><div className="text-xs text-slate-500">Students</div></div>
              <div className="text-center"><div className="font-poppins font-bold text-xl text-indigo-600">4.9★</div><div className="text-xs text-slate-500">Rating</div></div>
            </div>
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
        <Collapse
          accordion
          className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          expandIconPosition="end"
        >
          <Panel
            header={<span className="font-medium text-slate-800 dark:text-white">How do I enroll in a course?</span>}
            key="1"
            className="border-b border-slate-200 dark:border-slate-700"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Simply click the Sign Up button, fill in your details to register an account, then submit a payment to unlock full access.
            </p>
          </Panel>
          <Panel
            header={<span className="font-medium text-slate-800 dark:text-white">Are classes and courses self-paced?</span>}
            key="2"
            className="border-b border-slate-200 dark:border-slate-700"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Live classes run on a schedule, but recordings remain accessible. You can revisit lessons at any time.
            </p>
          </Panel>
          <Panel
            header={<span className="font-medium text-slate-800 dark:text-white">How does monthly membership work?</span>}
            key="3"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Pay each month to keep your membership active. Once approved by an admin, you instantly gain access to that month's classes.
            </p>
          </Panel>
        </Collapse>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-950 text-white py-14 px-4 md:px-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="font-poppins font-bold text-xl gradient-text mb-3">Devians LMS</div>
            <p className="text-slate-400 text-sm leading-relaxed">An innovative English learning platform empowering students worldwide to achieve academic excellence.</p>
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
            <p className="text-slate-400 text-sm leading-relaxed">© {year} Devians LMS Platform 🏛️<br />All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
