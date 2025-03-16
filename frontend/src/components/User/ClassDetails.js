import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Switch, Spin, Dropdown, Avatar, Card, } from "antd";
import {
  CloseOutlined,
  MenuOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { selectClassState } from "../../redux/features/classes/classSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";
import { fetchClasses } from "../../redux/features/classes/classActions";

const ClassDetails = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [filteredData, setFilteredData] = useState([]);
  const history = useNavigate();
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    user,
    loading: authLoading,
    error: authError,
  } = useSelector(selectAuthState);

  const { classes } = useSelector(selectClassState);

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

  useEffect(() => {
    dispatch(fetchClasses()); // Fetch classes initially
  }, [dispatch]);

  useEffect(() => {
    filterByMonth(); // Apply the filtering logic
  }, [classes]); // Reapply filter when classes are updated

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const filterByMonth = () => {
    const month = new Date().getMonth();
    // Format the classDate to "MMMM-YYYY"
    const formattedClasses = classes.map((item) => {
      const formattedDate = moment(item.classDate).format("MMMM-YYYY");
      return {
        ...item,
        classDateForFilter: formattedDate, // Format classDate
      };
    });
    console.log(formattedClasses);
    // Extract paid months & normalize them
    const paidMonths =
      user?.membership?.paidMonths?.map((pm) => pm.month.trim()) || [];
    console.log(paidMonths);
    // Filter classes based on user payment (matching classDate with paidMonths)
    const filtered = formattedClasses.filter((item) => {
      return (
        item.classGrade === user.grade &&
        paidMonths.includes(item.classDateForFilter) // Check if the user paid for this classDate
      );
    });
    setFilteredData(filtered);
  };

  // Group classes by year
  const groupClassesByYear = () => {
    return filteredData.reduce((acc, classItem) => {
      const year = moment(classItem.classDate).year();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(classItem);
      return acc;
    }, {});
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
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white mt-24">
        Your Classes
      </h1>
      {Object.keys(groupClassesByYear()).length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
          No classes available at the moment. Please check back later.
        </p>
      ) : (
        <div className="container mx-auto px-4 py-6">
          {Object.keys(groupClassesByYear()).map((year) => (
            <div key={year}>
              <h2 className="text-2xl font-bold text-center mt-4 text-gray-900 dark:text-white">
                {year}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                {groupClassesByYear()[year].map((classItem) => (
                  <Card
                    key={classItem.id}
                    hoverable
                    className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white dark:bg-gray-800"
                    cover={
                      <img
                        alt={classItem.className}
                        src="https://t3.ftcdn.net/jpg/02/27/26/82/360_F_227268299_liM3oGuQApMjXf23x7rSeFJxLgV6bMcC.jpg"
                        className="h-48 w-full object-cover"
                      />
                    }
                  >
                    <div className="border-b border-gray-300 dark:border-gray-700 my-2"></div>
                    <div className="p-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {classItem.className}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {classItem.description}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {moment(classItem.classDate).format("DD MMM YYYY")}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {classItem.classTime
                          ? moment(
                              classItem.classTime.replace(".", ":"),
                              "HH:mm"
                            ).format("hh:mm A")
                          : "No Time Available"}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {classItem.classGrade}
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <Button
                          type="primary"
                          icon={<VideoCameraOutlined />}
                          onClick={() =>
                            window.open(
                              classItem.classLink,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          disabled={
                            moment(classItem.classDate).isBefore(moment()) &&
                            moment(classItem.classDate).isAfter(
                              moment().subtract(1, "days")
                            )
                              ? false
                              : true
                          }
                        >
                          Join Class
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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

export default ClassDetails;
