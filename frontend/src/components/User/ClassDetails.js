import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Switch, Spin, Dropdown, Avatar, Card, Tag, Tooltip } from "antd";
import {
  CloseOutlined,
  MenuOutlined,
  VideoCameraOutlined,
  StopOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { selectClassState } from "../../redux/features/classes/classSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";
import { fetchClasses } from "../../redux/features/classes/classActions";

const getClassStatus = (classDate, classTime, isCancelled) => {
  if (isCancelled) return { label: "Cancelled", color: "error" };
  const classDateTime = moment(
    `${moment(classDate).format("YYYY-MM-DD")} ${classTime}`,
    "YYYY-MM-DD HH:mm"
  );
  const now = moment();
  const diffMins = classDateTime.diff(now, "minutes");
  if (diffMins > 15) return { label: "Upcoming", color: "processing" };
  if (diffMins >= -90 && diffMins <= 15) return { label: "Live Now 🔴", color: "success" };
  return { label: "Ended", color: "default" };
};

const canJoinClass = (classDate, classTime, isCancelled) => {
  if (isCancelled) return false;
  const classDateTime = moment(
    `${moment(classDate).format("YYYY-MM-DD")} ${classTime}`,
    "YYYY-MM-DD HH:mm"
  );
  const now = moment();
  const diffMins = classDateTime.diff(now, "minutes");
  return diffMins <= 15 && diffMins >= -90;
};

const ClassDetails = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [filteredData, setFilteredData] = useState([]);
  const [now, setNow] = useState(moment());

  const history = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuthState);
  const { classes } = useSelector(selectClassState);

  useEffect(() => {
    const timer = setTimeout(() => setLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Refresh the clock every minute to update Join button state
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

  useEffect(() => { dispatch(fetchClasses()); }, [dispatch]);

  useEffect(() => { filterByGradeAndPayment(); }, [classes, user]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const filterByGradeAndPayment = () => {
    if (!classes || !user) return;
    const formattedClasses = classes.map((item) => ({
      ...item,
      classDateForFilter: moment(item.classDate).format("MMMM-YYYY"),
    }));
    const paidMonths = user?.membership?.paidMonths?.map((pm) => pm.month.trim()) || [];
    const filtered = formattedClasses.filter(
      (item) =>
        item.classGrade === user.grade &&
        paidMonths.includes(item.classDateForFilter)
    );
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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
      <Button type="default" block className="mt-4 mb-2" onClick={() => history(`/user-profile/${user?.firstName}`)}>
        Profile
      </Button>
      <Button type="default" block className="mb-2" onClick={() => history(`/user-payments/${user?.firstName}`)}>
        Payments
      </Button>
      <Button type="default" block onClick={logoutHandler}>
        Logout
      </Button>
    </div>
  );

  return loader ? (
    <center className="mt-80"><Spin size="large" /></center>
  ) : (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center lg:px-10 md:px-6 px-4 z-50">
        <h1 className="text-xl font-bold">LMS Platform - Devians (ඩේවියන්ස්) 🏛️</h1>
        <div className="hidden md:flex gap-4">
          <Button
            type={user?.membership?.status === "active" ? "default" : "primary"}
            className="!h-10 flex items-center justify-center"
          >
            {user?.membership?.status === "active" ? "Classes" : "Enroll"}
          </Button>
          <Dropdown overlay={profileMenu} trigger={["click"]} placement="bottomRight">
            <div className="relative cursor-pointer">
              <Avatar
                className="bg-blue-500"
                size={40}
                src={user?.profilePhoto || undefined}
              >
                {!user?.profilePhoto && user?.firstName?.charAt(0).toUpperCase()}
              </Avatar>
              {user?.membership?.status && (
                <span className={`absolute top-0 right-0 text-sm ${user?.membership?.status === "active" ? "text-green-500" : "text-yellow-500"}`}>
                  {user?.membership?.status === "active" ? "✅" : "⏳"}
                </span>
              )}
            </div>
          </Dropdown>
        </div>
        <div className="md:hidden">
          <Button type="default" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </Button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col items-center space-y-4 z-50">
          {user?.membership?.status === "active" ? (
            <Button type="default">Classes</Button>
          ) : (
            <Button type="primary">Enroll</Button>
          )}
          <Button type="default" onClick={() => history(`/user-profile/${user?.firstName}`)}>Profile</Button>
          <Button type="default" onClick={() => history(`/user-payments/${user?.firstName}`)}>Payments</Button>
          <Button type="default" onClick={logoutHandler}>Logout</Button>
          <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="🌙" unCheckedChildren="☀️" />
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white mt-24">
        Your Classes
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
        Grade: <strong>{user?.grade}</strong> — Join button activates 15 min before class
      </p>

      {Object.keys(groupClassesByYear()).length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300 text-lg mt-10">
          No classes available. Check if your payment has been approved.
        </p>
      ) : (
        <div className="container mx-auto px-4 py-4">
          {Object.keys(groupClassesByYear()).sort((a, b) => b - a).map((year) => (
            <div key={year}>
              <h2 className="text-2xl font-bold text-center mt-6 mb-4 text-gray-900 dark:text-white">
                {year}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groupClassesByYear()[year].map((classItem) => {
                  const status = getClassStatus(classItem.classDate, classItem.classTime, classItem.isCancelled);
                  const joinable = canJoinClass(classItem.classDate, classItem.classTime, classItem.isCancelled);

                  return (
                    <Card
                      key={classItem._id}
                      hoverable={!classItem.isCancelled}
                      className={`rounded-xl overflow-hidden shadow-lg border ${classItem.isCancelled ? "border-red-300 opacity-70" : "border-gray-200"} bg-white dark:bg-gray-800`}
                      cover={
                        <div className="relative">
                          <img
                            alt={classItem.className}
                            src="https://t3.ftcdn.net/jpg/02/27/26/82/360_F_227268299_liM3oGuQApMjXf23x7rSeFJxLgV6bMcC.jpg"
                            className="h-40 w-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Tag color={status.color}>{status.label}</Tag>
                          </div>
                        </div>
                      }
                    >
                      <div className="p-1">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {classItem.className}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{classItem.description}</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                          📅 {moment(classItem.classDate).format("DD MMM YYYY")}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          🕐 {classItem.classTime ? moment(classItem.classTime, "HH:mm").format("hh:mm A") : "N/A"}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          🎓 {classItem.classGrade}
                        </p>

                        {classItem.notes && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                            <FileTextOutlined className="mr-1" />
                            {classItem.notes}
                          </div>
                        )}

                        {classItem.isCancelled && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900 rounded text-xs text-red-700 dark:text-red-300">
                            <StopOutlined className="mr-1" />
                            <strong>Cancelled</strong>
                            {classItem.cancellationReason && `: ${classItem.cancellationReason}`}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-4">
                          <Tooltip
                            title={
                              classItem.isCancelled
                                ? "This class has been cancelled"
                                : !joinable
                                ? "Join button activates 15 minutes before class"
                                : "Click to join the class"
                            }
                          >
                            <Button
                              type="primary"
                              icon={<VideoCameraOutlined />}
                              disabled={!joinable}
                              onClick={() =>
                                window.open(classItem.classLink, "_blank", "noopener,noreferrer")
                              }
                              className={joinable ? "animate-pulse" : ""}
                            >
                              {classItem.isCancelled ? "Cancelled" : joinable ? "Join Now!" : "Join Class"}
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="bg-gray-900 text-white p-6 mt-auto px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div><h4 className="font-bold text-lg">About</h4><p className="text-sm mt-2">An innovative learning platform for students worldwide.</p></div>
          <div><h4 className="font-bold text-lg">Quick Links</h4><ul className="text-sm mt-2"><li>Courses</li><li>Pricing</li><li>Blog</li><li>Help Center</li></ul></div>
          <div><h4 className="font-bold text-lg">Contact</h4><p className="text-sm mt-2">Email: support@lms.com</p><p className="text-sm">Phone: +123 456 7890</p></div>
          <div><h4 className="font-bold text-lg">©️ Copyrights - All rights reserved</h4><h6 className="font-bold text-lg sm:py-4">2025 Devians LMS Platform 🏛️</h6></div>
        </div>
      </footer>
    </div>
  );
};

export default ClassDetails;
