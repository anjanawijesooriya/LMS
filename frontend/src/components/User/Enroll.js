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
  Upload,
} from "antd";
import { CloseOutlined, MenuOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";
import { addPayment } from "../../redux/features/payments/paymentActions";

const { Option } = Select;

const Enroll = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const [loading, setLoading] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipUrl, setSlipUrl] = useState(null);

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

  useEffect(() => {
    form.setFieldsValue({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      studentId: user?.studentId || "",
    });
  }, [user, form]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const handleSlipUpload = async (file) => {
    setUploadingSlip(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/upload?folder=payment-slips", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setSlipUrl(res.data.url);
        setSlipFile(file);
        notification.success({ message: "Slip uploaded successfully" });
      }
    } catch (error) {
      notification.error({
        message: "Failed to upload slip. Please try again.",
      });
    } finally {
      setUploadingSlip(false);
    }
    return false; // prevent antd auto-upload
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
        amount: Number(amount),
        month,
        remarks: remarks || "",
        slipImage: slipUrl || null,
        year: new Date().getFullYear(),
      };

      const response = await dispatch(addPayment(requestData));

      if (response.success) {
        notification.success({
          message: "Payment Submitted",
          description:
            "Your payment details have been submitted. Awaiting admin approval.",
          placement: "topRight",
        });
        form.resetFields(["amount", "month", "remarks"]);
        setSlipFile(null);
        setSlipUrl(null);
      } else {
        notification.error({
          message: "Error",
          description: response.message || "Failed to submit payment.",
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Form error:", error);
    } finally {
      setLoading(false);
    }
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

      <div className="min-h-screen flex items-center justify-center p-4 mt-10 dark:text-white">
        <Card className="w-full max-w-lg shadow-lg p-6 bg-white rounded-lg mt-6">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Submit Payment
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Fill in your payment details below. An admin will review and approve
            your membership.
          </p>
          <Form layout="vertical" form={form}>
            <Form.Item label="First Name" name="firstName">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Last Name" name="lastName">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Student ID" name="studentId">
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Amount (Rs.)"
              name="amount"
              rules={[{ required: true, message: "Please enter the amount" }]}
            >
              <Input type="number" min={1} placeholder="Enter amount paid" />
            </Form.Item>
            <Form.Item
              label="Month"
              name="month"
              rules={[{ required: true, message: "Please select a month" }]}
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
                ].map((m) => (
                  <Option key={m} value={m}>
                    {m}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Remarks (optional)" name="remarks">
              <Input.TextArea
                placeholder="Any notes for the admin..."
                rows={2}
              />
            </Form.Item>
            <Form.Item label="Payment Slip (optional)">
              <Upload
                beforeUpload={handleSlipUpload}
                showUploadList={
                  slipFile ? [{ name: slipFile.name, status: "done" }] : false
                }
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploadingSlip}>
                  {slipFile ? "Change Slip" : "Upload Payment Slip"}
                </Button>
              </Upload>
              {slipUrl && (
                <p className="text-green-600 text-xs mt-1">
                  ✅ Slip uploaded successfully
                </p>
              )}
            </Form.Item>
            <Button
              type="primary"
              block
              loading={loading}
              onClick={handleSubmit}
              disabled={uploadingSlip}
            >
              Submit Payment
            </Button>
          </Form>
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

export default Enroll;
