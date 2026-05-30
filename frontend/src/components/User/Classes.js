import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Switch,
  Spin,
  Dropdown,
  Avatar,
} from "antd";
import {
  CloseOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Classes = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const history = useNavigate();
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    user,
    loading: authLoading,
    error: authError,
  } = useSelector(selectAuthState);

  useEffect(() => {
    const timer = setTimeout(() => setLoader(false), 1500);
    return () => clearTimeout(timer);
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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
      <div className="relative flex justify-center">
      </div>
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
        <h1 className="text-xl font-bold">LMS Platform - Devians (ඩේවියන්ස්) 🏛️</h1>
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4">
          <Button
            type={user?.membership.status === "active" ? "default" : "primary"}
            className="!h-10 flex items-center justify-center"
          >
            {user?.membership.status === "active" ? "Classes" : "Enroll"}
          </Button>
          {/* Profile Dropdown */}
          <Dropdown
            overlay={profileMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="relative cursor-pointer">
              <Avatar className="bg-blue-500" size={40}>
                {user?.firstName.charAt(0).toUpperCase()}
              </Avatar>
              {user?.membership.status && (
                <span
                  className={`absolute top-0 right-0 text-sm ${
                    user?.membership.status === "active"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {user?.membership.status === "active" ? "✅" : "⏳"}
                </span>
              )}
            </div>
          </Dropdown>
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
          {user?.membership.status === "active" ? (
            <Button type="default">Classes</Button>
          ) : (
            <Button type="primary">Enroll</Button>
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
        </div>
      )}
      {/*content*/}
      {/* Months Grid */}
      <div className="container mx-auto px-4 py-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {months.map((month, index) => {
          const currentMonthIndex = new Date().getMonth(); // Get the current month index (0-11)
          const currentYear = new Date().getFullYear(); // Get current year

          // Extract paid months & normalize them
          const paidMonths =
            user?.membership?.paidMonths?.map((pm) => pm.month.trim()) || [];

          // Format the current month-year string for comparison
          const monthYear = `${month.trim()}-${currentYear}`; // Ensure no extra spaces

          // Check if this month is in the future
          const isFutureMonth = index > currentMonthIndex;

          // Check if the user has paid for this month (case-insensitive comparison)
          const isPaidMonth = paidMonths.some(
            (paidMonth) => paidMonth.toLowerCase() === monthYear.toLowerCase()
          );

          // Disable if it's a not paid
          const isDisabled = !isPaidMonth || isFutureMonth;

          return (
            <div
              key={index}
              className={`relative h-40 rounded-lg overflow-hidden cursor-pointer shadow-lg transition transform ${
                isDisabled
                  ? "opacity-30 pointer-events-none"
                  : "hover:scale-105"
              }`}
              onClick={() =>
                !isDisabled &&
                history(`/classes/${user?.firstName}/${month.toLowerCase()}`)
              }
              style={{
                backgroundImage: `url("https://media.istockphoto.com/id/847375436/photo/word-learn-english-made-with-carved-letters-onyellow-desk-with-office-or-school-supplies.jpg?s=612x612&w=0&k=20&c=WpmGcNkhcTBY3sYijXynZVYIp0IBo3vLnWXGfPI2IoA=")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <h2 className="text-white text-2xl font-bold">{month}</h2>
              </div>
            </div>
          );
        })}
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

export default Classes;
