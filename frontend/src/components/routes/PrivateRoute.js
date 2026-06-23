import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Spin, Modal, Button } from "antd";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";

const PrivateRoute = ({ children, roles }) => {
  const [loader, setLoader] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const dispatch = useDispatch();

  const { token, user } = useSelector(selectAuthState);

  useEffect(() => {
    const checkSession = () => {
      const loginTime = localStorage.getItem("loginTime");
      if (!loginTime) return;

      const currentTime = new Date().getTime();
      const expirationTime = 24 * 60 * 60 * 1000;

      if (currentTime - loginTime > expirationTime) {
        setSessionExpired(true);
      }
    };

    setTimeout(() => {
      setLoader(false);
    }, 2000);

    checkSession();
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (!token || localStorage.getItem("authToken") === "null") {
    return loader ? (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg text-center"
        >
          <h1 className="text-2xl font-bold text-red-600">
            Unauthorized Access ❌
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Redirecting to login...
          </p>
          <div className="mt-4">
            <Spin size="large" />
          </div>
        </motion.div>
      </div>
    ) : (
      <Navigate to="/login" replace />
    );
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (sessionExpired) {
    return (
      <Modal
        title="Session Expired"
        open={sessionExpired}
        closable={false}
        footer={[
          <Button type="primary" key="logout" onClick={handleLogout}>
            Logout
          </Button>,
        ]}
      >
        <p>Your session has expired. Please log in again.</p>
      </Modal>
    );
  }

  return children;
};

export default PrivateRoute;
