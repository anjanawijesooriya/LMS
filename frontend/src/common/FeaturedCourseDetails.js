import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Switch, Spin, Dropdown, Avatar } from "antd";
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

  const { id } = useParams();

  useEffect(() => {
    console.log(id);
    if (id) {
      dispatch(getFeaturedCourse(id));
    }
  }, [dispatch, id]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const profileMenu = (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
      <div className="relative flex justify-center"></div>
      <Button
        type="default"
        block
        className="mt-4 mb-2"
        onClick={() => history(`/user-profile/${user?.firstName}`)}
      >
        Profile
      </Button>
      <Button
        type="default"
        block
        className="mb-2"
        onClick={() => history(`/user-payments/${user?.firstName}`)}
      >
        Payments
      </Button>
      <Button type="default" block onClick={logoutHandler}>
        Logout
      </Button>
    </div>
  );

  return loader ? (
    <center className="mt-80">
      <Spin size="large" />
    </center>
  ) : (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center lg:px-10 md:px-6 px-4 z-50">
        <h1 className="text-xl font-bold">
          LMS Platform - Devians (ඩේවියන්ස්) 🏛️
        </h1>
        {/* Desktop Menu */}
        {isAuthenticated ? (
          <div className="hidden md:flex gap-4">
            <Button
              type={
                user?.membership?.status === "active" ? "default" : "primary"
              }
              className="!h-10 flex items-center justify-center"
              onClick={() =>
                user?.membership?.status === "active"
                  ? history(`/user-classes/${user?.firstName}`)
                  : history(`/user-enroll/${user?.firstName}`)
              }
            >
              {user?.membership?.status === "active" ? "Classes" : "Enroll"}
            </Button>
            {/* Profile Dropdown */}
            <Dropdown
              overlay={profileMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="relative cursor-pointer">
                <Avatar className="bg-blue-500" size={40}>
                  {user?.firstName?.charAt(0).toUpperCase()}
                </Avatar>
                {user?.membership?.status && (
                  <span
                    className={`absolute top-0 right-0 text-sm ${
                      user?.membership.status === "active"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {user?.membership?.status === "active" ? "✅" : "⏳"}
                  </span>
                )}
              </div>
            </Dropdown>
          </div>
        ) : (
          <div className="hidden md:flex gap-4">
            <Button type="default" onClick={() => history("/login")}>
              Login
            </Button>
            <Button type="primary" onClick={() => history("/register")}>
              Sign Up
            </Button>
          </div>
        )}

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
          {isAuthenticated ? (
            <>
              {user?.membership?.status === "active" ? (
                <Button
                  type="default"
                  onClick={() => history(`/user-classes/${user?.firstName}`)}
                >
                  Classes
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => history(`/user-enroll/${user?.firstName}`)}
                >
                  Enroll
                </Button>
              )}
              {/* Profile Dropdown */}
              <Button
                type="default"
                onClick={() => history(`/user-profile/${user?.firstName}`)}
              >
                Profile
              </Button>
              <Button
                type="default"
                onClick={() => history(`/user-payments/${user?.firstName}`)}
              >
                Payments
              </Button>
              <Button type="default" onClick={logoutHandler}>
                Logout
              </Button>
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                checkedChildren="🌙"
                unCheckedChildren="☀️"
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col items-center justify-center mt-24 px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-3xl font-bold mb-6"
        >
          Course Details
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            hoverable
            className="w-full max-w-md md:max-w-xl lg:max-w-2xl shadow-lg rounded-xl bg-white dark:bg-gray-800 p-6"
            cover={
              <img
                alt={featuredCourse?.courseName}
                src={featuredCourse?.courseImage}
                className="rounded-t-xl object-cover w-full h-56"
              />
            }
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {featuredCourse?.courseName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {featuredCourse?.description}
            </p>
            <p className="text-gray-700 dark:text-gray-400 mt-2 font-medium">
              Instructor: {featuredCourse?.instructor}
            </p>
          </Card>
        </motion.div>
      </div>

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

export default FeaturedCourseDetails;
