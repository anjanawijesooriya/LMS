import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Input,
  Card,
  Switch,
  Spin,
  Dropdown,
  Avatar,
  Form,
  Select,
  notification,
  Modal,
  Upload,
} from "antd";
import {
  CloseOutlined,
  MenuOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import {
  logoutUser,
  editUser,
  deleteUser,
} from "../../redux/features/auth/authActions";

const { Option } = Select;
const { confirm } = Modal;

const GRADES = [
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
];

const Profile = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const history = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuthState);
  const [form] = Form.useForm();

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

  const handlePhotoUpload = async (file) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/upload?folder=profile-photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        const response = await dispatch(
          editUser({ id: user?.id, profilePhoto: res.data.url }),
        );
        if (response.success) {
          notification.success({ message: "Profile photo updated!" });
        }
      }
    } catch (error) {
      notification.error({
        message: "Failed to upload photo. Please try again.",
      });
    } finally {
      setUploadingPhoto(false);
    }
    return false;
  };

  const handleDeleteAccount = () => {
    confirm({
      title: "Are you sure you want to delete your account?",
      icon: <ExclamationCircleOutlined />,
      content:
        "This action is irreversible. All your data will be permanently lost.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const response = await dispatch(deleteUser(user?.id));
        if (response.success) {
          notification.success({
            message: "Account Deleted",
            description: "Your account has been successfully deleted.",
          });
          setTimeout(() => {
            dispatch(logoutUser());
            history("/login");
          }, 2000);
        } else {
          notification.error({
            message: "Error",
            description: response.message,
          });
        }
      },
    });
  };

  const profileMenu = (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
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
      notification.success({ message: "Profile updated successfully!" });
      setEditing(false);
      setLoading(false);
      setTimeout(() => {
        notification.warning({
          message: "Please log in again to see your changes.",
        });
        setTimeout(() => {
          dispatch(logoutUser());
          history("/login");
        }, 2000);
      }, 2000);
    } else {
      notification.error({ message: "Error", description: response.message });
      setLoading(false);
    }
  };

  return loader ? (
    <center className="mt-80">
      <Spin size="large" />
    </center>
  ) : (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center lg:px-10 md:px-6 px-4 z-50">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => history(`/user-dashboard/${user?.firstName}`)}
        >
          LMS Platform - Devians (ඩේවියන්ස්) 🏛️
        </h1>
        <div className="hidden md:flex gap-4">
          <Button
            type={user?.membership?.status === "active" ? "default" : "primary"}
            className="!h-10 flex items-center justify-center"
            onClick={() =>
              user?.membership?.status === "active"
                ? history(`/user-classes/${user?.firstName}`)
                : history(`/user-enroll/${user?.firstName}`)
            }
          >
            {user?.membership?.status === "active" ? "Classes" : "Enroll"}
          </Button>
          <Dropdown
            overlay={profileMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="relative cursor-pointer">
              <Avatar
                className="bg-blue-500"
                size={40}
                src={user?.profilePhoto || undefined}
              >
                {!user?.profilePhoto &&
                  user?.firstName?.charAt(0).toUpperCase()}
              </Avatar>
              {user?.membership?.status && (
                <span
                  className={`absolute top-0 right-0 text-sm ${user?.membership?.status === "active" ? "text-green-500" : "text-yellow-500"}`}
                >
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
          <div className="text-center mb-6">
            {/* Profile Photo with Upload */}
            <div className="relative inline-block mb-4">
              <Avatar
                size={110}
                className="bg-blue-500"
                src={user?.profilePhoto || undefined}
              >
                {!user?.profilePhoto &&
                  user?.firstName?.charAt(0).toUpperCase()}
              </Avatar>
              <Upload
                beforeUpload={handlePhotoUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  size="small"
                  shape="circle"
                  icon={
                    uploadingPhoto ? <LoadingOutlined /> : <CameraOutlined />
                  }
                  className="absolute bottom-0 right-0"
                  loading={uploadingPhoto}
                />
              </Upload>
            </div>

            <h2 className="text-2xl font-semibold dark:text-white">{`${user?.firstName} ${user?.lastName}`}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Student ID: <strong>{user?.studentId}</strong>
            </p>
            <p className="text-sm mt-1">
              Status:{" "}
              <span
                className={
                  user?.membership?.status === "active"
                    ? "text-green-600 font-semibold"
                    : "text-yellow-600 font-semibold"
                }
              >
                {user?.membership?.status === "active"
                  ? "Active ✅"
                  : "Pending ⌛"}
              </span>
            </p>
            <p className="text-sm text-gray-500">Email: {user?.email}</p>
            <p className="text-sm text-gray-500">Grade: {user?.grade}</p>
            <p className="text-sm text-gray-500">
              Phone: {user?.telephoneNumber}
            </p>

            {user?.membership?.paidMonths?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1">Paid Months</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {user.membership.paidMonths.map((pm, i) => (
                    <span
                      key={i}
                      className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full"
                    >
                      {pm.month}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {user?.membership?.status === "active" && (
              <Button
                type="primary"
                className="w-full"
                onClick={() => history(`/user-classes/${user?.firstName}`)}
              >
                View My Classes
              </Button>
            )}
            {user?.membership?.status !== "active" && (
              <Button
                type="default"
                className="w-full"
                onClick={() => history(`/user-enroll/${user?.firstName}`)}
              >
                Enroll / Pay
              </Button>
            )}

            {editing ? (
              <Form form={form} onFinish={handleSave} layout="vertical">
                <Form.Item
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
                    {GRADES.map((grade) => (
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
                <div className="flex gap-2">
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
                  <Button block onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </Form>
            ) : (
              <div className="space-y-2">
                <Button type="primary" className="w-full" onClick={handleEdit}>
                  Edit Profile
                </Button>
                <Button
                  type="primary"
                  danger
                  className="w-full"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

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

export default Profile;
