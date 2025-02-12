import { Modal, Button, Tooltip, Input, Spin, ConfigProvider } from "antd";
import React, { useState, useEffect } from "react";
import { Form } from "antd";
import {
  InfoCircleOutlined,
  MailOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useLocation } from "react-router-dom";

const ForgotPassword = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [theme, setTheme] = useState("light");

  const location = useLocation();
  const [form] = Form.useForm();

  useEffect(() => {
    // Detect system dark mode
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(darkMode ? "dark" : "light");

    // Listener for theme changes
    const themeChangeListener = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", themeChangeListener);

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", themeChangeListener);
    };
  }, []);

  const forgotPasswordHandler = async () => {
    setLoading(true);
    const config = { headers: { "Content-Type": "application/json" } };

    try {
      const { data } = await axios.post(
        "http://localhost:8070/api/auth/forgotpassword",
        { email },
        config
      );

      setSuccess(data.verify);
      setTimeout(() => {
        setLoading(false);
        setVisible(false);
      }, 3000);
    } catch (error) {
      setError(error.response.data.error);
      setTimeout(() => {
        setLoading(false);
        setError("");
        setSuccess("");
      }, 5000);
    }
  };

  return (
    <ConfigProvider theme={{ mode: theme }}>
      <a
        className="forget-text cursor-pointer text-blue-600 dark:text-blue-400"
        onClick={() => setVisible(true)}
      >
        Forgot password?
      </a>
      <Modal
        open={visible}
        title={
          <span className="text-gray-800 dark:text-white">
            Password Request Form
          </span>
        }
        onCancel={() => setVisible(false)}
        footer={null}
        className="dark:bg-gray-900"
      >
        <div className="text-center">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>

        <Form
          form={form}
          name="forgot-password"
          onFinish={forgotPasswordHandler}
          className="space-y-4"
        >
          <Form.Item
            name="email"
            label={
              <span className="text-gray-700 dark:text-gray-300">Email</span>
            }
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Enter a valid email address!" },
              { max: 50, message: "Email must be under 50 characters!" },
            ]}
          >
            <Input
              className="w-full p-2 border rounded-lg dark:bg-gray-100 dark:border-gray-700 dark:text-black"
              placeholder="Enter your registered email"
              prefix={
                <MailOutlined className="text-gray-500 dark:text-black" />
              }
              suffix={
                <Tooltip title="Enter the email associated with your account">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-center gap-4">
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-600 dark:bg-blue-500"
              >
                {loading ? (
                  <>
                    <Spin indicator={<LoadingOutlined />} /> Requesting...
                  </>
                ) : (
                  "Request"
                )}
              </Button>
              <Button
                onClick={() => setVisible(false)}
                className="bg-gray-400 dark:bg-gray-200"
              >
                Return
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default ForgotPassword;
