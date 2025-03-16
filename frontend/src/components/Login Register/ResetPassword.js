import { Button, Form, Input, Layout, notification, Spin, Card } from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const { Header } = Layout;

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const { resetToken } = useParams();
  const navigate = useNavigate(); // For redirecting after success

  useEffect(() => {
    setTimeout(() => {
      setLoader(true);
    }, 3000);
  }, []);

  const [form] = Form.useForm();

  // Validate password length dynamically
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setIsValid(value.length >= 6 && value.length <= 20);
  };

  const resetPasswordHandler = async () => {
    setLoading(true);
    try {
      await axios.put(`/api/auth/passwordreset/${resetToken}`, { password });

      setLoading(false); // Ensure loading stops before notification

      // Show success notification
      notification.success({
        message: "Password Reset Successfully",
        description: "You can now log in with your new password.",
        placement: "top",
      });

      // Redirect to home after a slight delay
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (error) {
      notification.error({
        message: "Reset Failed",
        description: error.response?.data?.message || "Something went wrong.",
      });
      setLoading(false);
    }
  };

  return (
    <>
      {!loader ? (
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      ) : (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900">
          <Header className="text-center text-3xl font-bold text-black bg-gray-100 dark:text-gray-200 dark:bg-gray-900 p-6">
            Devians - LMS
          </Header>

          <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-4">
              Reset Your Password
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              Enter your new password below.
            </p>

            <Form form={form} name="reset-password" onFinish={resetPasswordHandler}>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please enter a new password!" }]}
              >
                <Input.Password
                  placeholder="New Password"
                  className="w-full p-3 border rounded-lg"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </Form.Item>

              {/* Password length validation message */}
              {password.length > 0 && !isValid && (
                <p className="text-red-500 text-sm mb-2">
                  Password must be between 6 and 20 characters.
                </p>
              )}

              <Button
                type="primary"
                htmlType="submit"
                className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                disabled={!isValid || loading}
              >
                {loading ? <Spin size="small" /> : "Reset Password"}
              </Button>
            </Form>

            <div className="mt-4 text-center">
              <a href="/" className="text-blue-600 hover:underline dark:text-blue-400">
                Back to Home
              </a>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ResetPassword;