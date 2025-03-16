import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Input,
  Card,
  Rate,
  Switch,
  Spin,
  Collapse,
  Dropdown,
  Avatar,
  Form,
  Upload,
  message,
  Select,
  notification,
} from "antd";
import {
  SearchOutlined,
  MoonOutlined,
  SunOutlined,
  CloseOutlined,
  MenuOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";
import { addPayment } from "../../redux/features/payments/paymentActions";

const { Dragger } = Upload;
const { Option } = Select;

const { Panel } = Collapse;

const Enroll = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const history = useNavigate();
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    user,
    loading: authLoading,
    error: authError,
  } = useSelector(selectAuthState);
  const [form] = Form.useForm();

  // Get user details from localStorage
  const lastName = localStorage.getItem("lastname") || "";
  const studentId = localStorage.getItem("studentID") || "";

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
    form.setFieldsValue({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      studentId: user?.studentId || "",
    });
  }, []);

  const logoutHandler = () => {
    dispatch(logoutUser());
    setAvailable(false);
    history("/login");
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const { firstName, lastName, studentId, amount, month, remarks } = values;

      const requestData = {
        firstName,
        lastName,
        studentId,
        amount,
        month,
        remarks,
      };

      console.log("Submitted Data:", requestData);

      const response = await dispatch(addPayment(requestData));

      if (response.success) {
        setTimeout(() => {
          notification.success({
            message: "Success",
            description: "Payment details added Successfully!",
            placement: "top",
          });
          form.setFieldsValue({
            amount: undefined,
            month: undefined,
            remarks: undefined,
          });
          setLoading(false);
        }, 3000);
      } else {
        setLoading(false);
        notification.error({
          message: "Error",
          description: response.message,
          placement: "top",
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Form validation failed:", error);
      if (error.message === "Please enter the amount!") {
        notification.error({
          message: "Error",
          description: "Please enter the amount!",
          placement: "top",
        });
      } else if (error.message === "Please select a month!") {
        notification.error({
          message: "Error",
          description: "Please select a month!",
          placement: "top",
        });
      } else {
        notification.error({
          message: "Error",
          description: "Form validation failed!",
          placement: "top",
        });
      }
    }
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
            {luser?.membership?.status === "active" ? (
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
        <div className="min-h-screen flex items-center justify-center p-4 mt-10 dark:text-white">
          <Card className="w-full max-w-lg shadow-lg p-6 bg-white rounded-lg mt-6">
            <h2 className="text-2xl font-semibold text-center mb-4">
              Add Payment Details
            </h2>
            <Form layout="vertical" form={form}>
              <Form.Item label="First Name" name="firstName">
                <Input disabled className="dark:bg-gray-700 dark:text-white" />
              </Form.Item>
              <Form.Item label="Last Name" name="lastName">
                <Input disabled className="dark:bg-gray-700 dark:text-white" />
              </Form.Item>
              <Form.Item label="Student ID" name="studentId">
                <Input disabled className="dark:bg-gray-700 dark:text-white" />
              </Form.Item>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[
                  { required: true, message: "Please enter the amount!" },
                ]}
              >
                <Input type="number" placeholder="Enter amount" />
              </Form.Item>
              <Form.Item
                label="Month"
                name="month"
                rules={[{ required: true, message: "Please select a month!" }]}
              >
                <Select placeholder="Select Month">
                  {[
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
                  ].map((month) => (
                    <Option key={month} value={month}>
                      {month}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea placeholder="Optional remarks" rows={3} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Form>
          </Card>
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
    </>
  );
};

export default Enroll;
