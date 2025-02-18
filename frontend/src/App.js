import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ArrowUpOutlined } from "@ant-design/icons";
import { Button } from "antd";

//routes
import PrivateRoute from "./components/routes/PrivateRoute";
import PageNotFound from "./components/routes/Pagenotfound";

//components
import Login from "./components/Login Register/Login";
import Register from "./components/Login Register/Register";
import ResetPassword from "./components/Login Register/ResetPassword";
import Home from "./common/Home";
import UserHome from "./components/User/userHome";

//Admin
import Dashboard from "./components/Admin/Dashboard";

const App = () => {
  const [showButton, setShowButton] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Home component dynamically handles logged-in and guest users */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/passwordreset/:resetToken" element={<ResetPassword />} />
        <Route
          path="/user-dashboard/:username"
          element={
            <PrivateRoute>
              <UserHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard/:username"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      {showButton && (
        <div className="fixed bottom-5 right-5 text-3xl p-2 cursor-pointer">
          <Button
            type="primary"
            size="large"
            shape="circle"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUpOutlined />
          </Button>
        </div>
      )}
    </Router>
  );
};

export default App;
