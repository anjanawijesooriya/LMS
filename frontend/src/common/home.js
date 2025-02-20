import React, { useEffect, useState } from "react";
import { Button, Input, Card, Rate, Switch, Spin, Collapse } from "antd";
import {
  SearchOutlined,
  MoonOutlined,
  SunOutlined,
  CloseOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const Home = () => {
  const [available, setAvailable] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [loader, setLoader] = useState(true);

  const history = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return loader ? (
    <center className="mt-80">
      <Spin size="large" />
    </center>
  ) : (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center lg:px-10 md:px-6 px-4 z-50">
        <h1 className="text-xl font-bold">LMS Platform - Devians 🏛️</h1>
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4">
          <Input
            placeholder="Search courses..."
            className="w-64 dark:bg-gray-700 dark:text-black"
            prefix={<SearchOutlined />}
          />
          <Button type="default" onClick={() => history("/login")}>
            Login
          </Button>
          <Button type="primary" onClick={() => history("/register")}>
            Sign Up
          </Button>
          {/* <Switch
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
          /> */}
        </div>

        {/* Mobile & Medium Menu Toggle */}
        <div className="md:hidden">
          <Button type="default" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </Button>
        </div>
      </nav>

      {/* Responsive Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col items-center space-y-4 z-50">
          <Input
            placeholder="Search courses..."
            className="w-64 dark:bg-gray-700 dark:text-black"
            prefix={<SearchOutlined />}
          />
          <Button type="default" onClick={() => history("/login")}>
            Login
          </Button>
          <Button type="primary" onClick={() => history("/register")}>
            Sign Up
          </Button>
          <Switch
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
          />
        </div>
      )}

      {/* Hero Section */}
      <header className="h-[80vh] flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center p-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold"
          animate={{ y: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          Unlock Your Potential with Expert English Learning
        </motion.h2>
        <p className="mt-4 text-lg md:text-xl">
          Join thousands of students learning from top educators
        </p>
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <Button type="default" className="bg-white text-blue-600">
            Explore Courses
          </Button>
          <Button type="default" className="border-white text-black">
            Get Started
          </Button>
        </div>
      </header>

      {/* Featured Courses */}
      <motion.section
        className="py-12 px-4 md:px-6 lg:px-10"
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-center">
          Featured Courses
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {[1, 2, 3, 4].map((_, index) => (
            <Card
              key={index}
              hoverable
              cover={
                <img
                  alt="Course"
                  src="/course-placeholder.jpg"
                  className="rounded-lg w-full"
                />
              }
              className="p-4 dark:bg-gray-800"
            >
              <h4 className="font-bold mt-2">Course Title</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Instructor Name
              </p>
              <Rate disabled defaultValue={5} className="mt-2" />
              <Button type="primary" className="mt-3 w-full">
                Enroll Now
              </Button>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section
        className="py-12 px-4 md:px-6 lg:px-10 text-center"
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl md:text-3xl font-bold">Why Choose Us?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="p-4 dark:bg-gray-800">
            <h4 className="font-bold">🏆 Industry-Recognized Certifications</h4>
            <p>Buildup knowledge and boost your career opportunities.</p>
          </Card>
          <Card className="p-4 dark:bg-gray-800">
            <h4 className="font-bold">📞 24/7 Support & Live Sessions</h4>
            <p>Learn anytime with expert support and live mentoring.</p>
          </Card>
          <Card className="p-4 dark:bg-gray-800">
            <h4 className="font-bold">✅ Expert Mentors</h4>
            <p>Improve your knowledge with best mentor.</p>
          </Card>
        </div>
      </motion.section>

      {/* Instructor Showcase */}
      <motion.section
        className="py-12 px-4 md:px-6 lg:px-96 text-center"
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl md:text-3xl font-bold">Meet Your Instructor</h3>
        <Card className="mt-6 p-6 dark:bg-gray-800">
          <img
            src="/instructor.jpg"
            alt="Instructor"
            className="rounded-full w-32 h-32 mx-auto"
          />
          <h4 className="font-bold mt-4 dark:text-white">Kumuduni Dammika</h4>
          <p className="text-gray-600 dark:text-gray-300">
            Expert English Instructor with 10+ years of experience.
          </p>
        </Card>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="py-12 px-4 md:px-6 lg:px-10"
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-center">FAQs</h3>
        <Collapse
          accordion
          className="mt-6 dark:bg-gray-600 dark:text-white font-bold"
        >
          <Panel header="How do I enroll?" key="1" className="dark: text-white">
            <p>Simply sign up and choose a course to start learning.</p>
          </Panel>
          <Panel header="Are courses self-paced?" key="2">
            <p>Yes, you can learn at your own pace with lifetime access.</p>
          </Panel>
        </Collapse>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white p-6 mt-auto px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="font-bold text-lg">About</h4>
            <p className="text-sm mt-2">
              An innovative learning platform for students worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg">Quick Links</h4>
            <ul className="text-sm mt-2">
              <li>Courses</li>
              <li>Pricing</li>
              <li>Blog</li>
              <li>Help Center</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg">Contact</h4>
            <p className="text-sm mt-2">Email: support@lms.com</p>
            <p className="text-sm">Phone: +123 456 7890</p>
          </div>
          <div>
            <h4 className="font-bold text-lg">
              ©️ Copyrights - All rights reserved
            </h4>
            <h6 className="font-bold text-lg sm:py-4">
              2025 Devians LMS Platform 🏛️
            </h6>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
