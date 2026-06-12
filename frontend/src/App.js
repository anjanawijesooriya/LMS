import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "@ant-design/v5-patch-for-react-19";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ArrowUpOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { selectAuthState } from "./redux/features/auth/authSelectors";

//routes
import PrivateRoute from "./components/routes/PrivateRoute";
import PageNotFound from "./components/routes/Pagenotfound";

//components
import Login from "./components/Login Register/Login";
import Register from "./components/Login Register/Register";
import ResetPassword from "./components/Login Register/ResetPassword";
import Home from "./common/home";
import FeaturedCourseDetails from "./common/FeaturedCourseDetails";
import UserHome from "./components/User/userHome";
import Enroll from "./components/User/Enroll";
import Classes from "./components/User/Classes";
import Profile from "./components/User/Profile";
import Payments from "./components/User/Payments";
import ClassDetails from "./components/User/ClassDetails";

//Admin
import Dashboard from "./components/Admin/Dashboard";

const App = () => {
  const [showButton, setShowButton] = useState(false);

  const { user, isAuthenticated } = useSelector(selectAuthState);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
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
        <Route
          path={
            isAuthenticated
              ? "/featured-course/:username/:id"
              : "/featured-course/:id"
          }
          element={<FeaturedCourseDetails />}
        />
        <Route path="/passwordreset/:resetToken" element={<ResetPassword />} />
        {/*logged user*/}
        <Route
          path="/user-dashboard/:username"
          element={
            <PrivateRoute>
              <UserHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-enroll/:username"
          element={
            <PrivateRoute>
              <Enroll />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-profile/:username"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-payments/:username"
          element={
            <PrivateRoute>
              <Payments />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-classes/:username"
          element={
            <PrivateRoute>
              <Classes />
            </PrivateRoute>
          }
        />
        <Route
          path="/classes/:username/:year/:month"
          element={
            <PrivateRoute>
              <ClassDetails />
            </PrivateRoute>
          }
        ></Route>
        {/*admin*/}
        <Route
          path="/admin-dashboard/:username"
          element={
            <PrivateRoute roles={["admin"]}>
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
