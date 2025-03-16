import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Switch, Spin, Dropdown, Avatar, Tag, Table } from "antd";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";
import { fetchPayments } from "../../redux/features/payments/paymentActions";
import { selectPayments } from "../../redux/features/payments/paymentSelectors";

const Payments = () => {
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

  const { payments } = useSelector(selectPayments);

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
    dispatch(fetchPayments());
  }, [dispatch]);

  useEffect(() => {
    filterByStd();
  }, [payments]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const filterByStd = () => {
    if (!payments) {
      console.log("Payments data is not available yet.");
      return;
    }

    // Filter the payments array by comparing studentId
    const filtered = payments?.filter(
      (payment) => payment.studentId === user.studentId
    );

    // Set the filtered data to the state
    setFilteredData(filtered);
  };

  const profileMenu = (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
      <div className="relative flex justify-center">
        {/* <Avatar className="bg-blue-500" size={40}>
                {firstName.charAt(0).toUpperCase()}
              </Avatar>
              {userStatus && (
                <span
                  className={`absolute top-0 right-0 text-lg ${
                    userStatus === "active" ? "text-green-500" : "text-yellow-500"
                  }`}
                >
                  {userStatus === "active" ? "✅" : "⏳"}
                </span>
              )} */}
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

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: (month) => month,
      // Adding filter functionality for classDate
      filters: [
        { text: "January", value: "January" },
        { text: "February", value: "February" },
        { text: "March", value: "March" },
        { text: "April", value: "April" },
        { text: "May", value: "May" },
        { text: "June", value: "June" },
        { text: "July", value: "July" },
        { text: "August", value: "August" },
        { text: "September", value: "September" },
        { text: "October", value: "October" },
        { text: "November", value: "November" },
        { text: "December", value: "December" },
      ],
      onFilter: (value, record) => record.month === value,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Approved", value: "approved" },
        { text: "Pending", value: "pending" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => (
        <Tag
          color={record.status === "approved" ? "green" : "gold"}
          className="flex items-center gap-2"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              record.status === "approved" ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          {record.status?.replace(/^./, (char) => char.toUpperCase())}
        </Tag>
      ),
    },
  ];

  return loader ? (
    <center className="mt-80">
      <Spin size="large" />
    </center>
  ) : (
    <>
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Navbar */}
        <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center lg:px-10 md:px-6 px-4 z-50">
          <h1 className="text-xl font-bold">
            LMS Platform - Devians (ඩේවියන්ස්) 🏛️
          </h1>
          {/* Desktop Menu */}
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
                      user?.membership?.status === "active"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {user?.membership?.status === "active" ? "✅" : "⏳"}
                  </span>
                )}
              </div>
            </Dropdown>
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
          </div>
        )}
        {/*Content*/}
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white mt-24">
          Payment History
        </h1>
        <Table
          className="mt-18"
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          bordered
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }} // Enables horizontal scrolling
          responsive // Ensures the table adapts to smaller screens
        />
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
    </>
  );
};

export default Payments;
