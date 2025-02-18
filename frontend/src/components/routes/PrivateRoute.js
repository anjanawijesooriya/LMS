import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

const PrivateRoute = ({ children }) => {
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 2000);
  }, []);

  if (!localStorage.getItem("authToken") || localStorage.getItem("authToken") === "null") {
    return loader ? (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg text-center"
        >
          <h1 className="text-2xl font-bold text-red-600">Unauthorized Access ❌</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Redirecting to login...</p>
          <div className="mt-4">
            <Spin size="large" />
          </div>
        </motion.div>
      </div>
    ) : (
      <Navigate to="/login" replace />
    );
  }

  return children;
};

export default PrivateRoute;