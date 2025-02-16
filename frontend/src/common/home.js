import React, { useEffect, useState } from "react";
import { Button, Input, Card, Rate, Switch } from "antd";
import {
  SearchOutlined,
  MoonOutlined,
  SunOutlined,
  CloseOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Home = ({ isAuthenticated }) => {
  const [available, setAvailable] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const history = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      setAvailable(true);
    }
  }, [available]);

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
    localStorage.clear();
    setAvailable(false);
    history("/login");
  };

  return (
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
          {isAuthenticated ? (
            <>
              {localStorage.getItem("status") === "active" ? (
                <Button type="default">Courses</Button>
              ) : (
                <Button type="primary">Enroll</Button>
              )}
              <Button type="default">Profile</Button>
              <Button type="default" onClick={logoutHandler}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button type="default" onClick={() => history("/login")}>
                Login
              </Button>
              <Button type="primary" onClick={() => history("/register")}>
                Sign Up
              </Button>
            </>
          )}
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
          {isAuthenticated ? (
            <>
              {localStorage.getItem("status") === "active" ? (
                <Button type="default">Courses</Button>
              ) : (
                <Button type="primary">Enroll</Button>
              )}
              <Button type="default">Profile</Button>
              <Button type="default" onClick={logoutHandler}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button type="default" onClick={() => history("/login")}>
                Login
              </Button>
              <Button type="primary" onClick={() => history("/register")}>
                Sign Up
              </Button>
            </>
          )}
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
          Unlock Your Potential with High-Quality Online Learning
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
      <section className="py-12 px-4 md:px-6 lg:px-10">
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
      </section>

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
            <h4 className="font-bold text-lg">Newsletter</h4>
            <Input
              placeholder="Enter your email"
              className="mt-2 dark:bg-gray-700 dark:text-white"
            />
            <Button type="primary" className="mt-2 w-full">
              Subscribe
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
