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
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser, editUser } from "../../redux/features/auth/authActions";

const { Option } = Select;

const Profile = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const history = useNavigate();
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    user,
    loading: authLoading,
    error: authError,
  } = useSelector(selectAuthState);
  const [form] = Form.useForm();

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

  const logoutHandler = () => {
    dispatch(logoutUser());
    setAvailable(false);
    history("/login");
  };

  const firstName = localStorage.getItem("firstname") || "U";
  const userStatus = localStorage.getItem("status");
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

  const handleEdit = () => {
    setEditing(true);
    form.setFieldsValue({
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      grade: user?.grade,
      telephoneNumber: user?.telephoneNumber,
    });
  };

  const handleSave = async (values) => {
    setLoading(true);
    const updatedUserData = { ...values, id: user?.id };

    const response = await dispatch(editUser(updatedUserData));

    if (response.success) {
      setTimeout(() => {
        notification.success({
          message: "Success",
          description: "Profile updated Successfully✅",
          placement: "top",
        });
        setEditing(false);
        setLoading(false);

        setTimeout(() => {
          notification.warning({
            message: "Logging Out",
            description: "You are logging out now, Please login again.",
            placement: "top",
          });

          setTimeout(() => {
            dispatch(logoutUser());
            history("/login");
          }, 3000); // Delay logout after showing warning message
        }, 3000);// Delay warning message after success
      }, 3000); 
    } else {
      notification.error({
        message: "Error",
        description: response.message,
        placement: "top",
      });
      setEditing(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return loader ? (
    <center className="mt-80">
      <Spin size="large" />
    </center>
  ) : (
    <>
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Navbar */}
        <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center lg:px-10 md:px-6 px-4 z-50">
          <h1 className="text-xl font-bold">LMS Platform - Devians 🏛️</h1>
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

        <div className="flex justify-center items-center min-h-screen pt-20 pb-10">
          <Card className="w-full sm:max-w-md lg:max-w-lg shadow-lg rounded-lg bg-white dark:bg-gray-800 p-8">
            <div className="text-center mb-4">
              <Avatar size={120} className="mx-auto mb-4 bg-blue-500">
                {user?.firstName?.charAt(0).toUpperCase()}
              </Avatar>
              <h2 className="text-2xl font-semibold mb-2 dark:text-white">{`${user?.firstName} ${user?.lastName}`}</h2>
              <p className="text-sm text-gray-500">{`Student ID: ${user?.studentId}`}</p>
              <p className="text-sm text-gray-500">{`Status: ${
                user?.membership?.status === "active"
                  ? "Active ✅"
                  : "Pending ⌛"
              }`}</p>
              <p className="text-sm text-gray-500">{`Email: ${user?.email}`}</p>
              <p className="text-sm text-gray-500">{`Grade: ${user?.grade}`}</p>
              <p className="text-sm text-gray-500">{`Phone: ${user?.telephoneNumber}`}</p>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                {user?.membership?.status === "active" ? (
                  <Button
                    type="primary"
                    className="w-full"
                    onClick={() => history(`/user-classes/${user?.firstName}`)}
                  >
                    View My Classes
                  </Button>
                ) : null}
              </div>
              <div className="text-center">
                {user?.membership?.status === "active" ? null : (
                  <Button
                    type="default"
                    className="w-full"
                    onClick={() => history(`/user-enroll/${user?.firstName}`)}
                  >
                    Enroll
                  </Button>
                )}
              </div>
              {editing ? (
                <Form
                  form={form}
                  onFinish={handleSave}
                  layout="vertical"
                  className="space-y-4 dark:text-white"
                >
                  <Form.Item
                    className=" dark:text-white"
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: "email" }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Grade"
                    name="grade"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Select Grade">
                      {[
                        "Pre-School",
                        "Grade 1",
                        "Grade 2",
                        "Grade 3",
                        "Grade 4",
                        "Grade 5",
                        "Grade 6",
                        "Grade 7",
                        "Grade 8",
                        "Grade 9",
                        "Grade 10",
                        "Grade 11",
                        "Grade 12",
                        "Grade 13",
                      ].map((grade) => (
                        <Option key={grade} value={grade}>
                          {grade}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="Phone"
                    name="telephoneNumber"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    disabled={loading}
                  >
                    {loading ? (
                      <Spin indicator={<LoadingOutlined />} />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Form>
              ) : (
                <div className="text-center">
                  <Button
                    type="primary"
                    className="w-full"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
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

export default Profile;
