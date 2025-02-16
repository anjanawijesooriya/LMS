import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ArrowUpOutlined } from "@ant-design/icons";
import { Button } from "antd";

//common
// import Home from "./common/Home";
// import NavBar from "./common/NavBar";
// import Footer from "./common/Footer";

//routes
// import PrivateRoute from "./routes/PrivateRoute";
// import PageNotFound from "./routes/PageNotFound";

//components
import Login from "./components/Login Register/Login";
import Register from "./components/Login Register/Register";
import ResetPassword from "./components/Login Register/ResetPassword";
import Home from "./common/Home";

//Admin
import Dashboard from "./components/Admin/Dashboard";

const App = () => {
  const [showButton, setShowButton] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        setShowButton(!showButton);
      } else {
        setShowButton(false);
      }
    });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if(localStorage.getItem("authToken") !== null){
      setAvailable(true);
    }
  })

  return (
    <div>
      <Router>
        <Routes>
          {/* <Route path="/" element={[<NavBar />, <Home />, <Footer />]} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/passwordreset/:resetToken"
            element={<ResetPassword />}
          />
          {available ? (
            <Route path="/home/:username" element={<Home />} />
          ): (
            <Route path="/" element={<Home />} />
          )}
          
          <Route path="/admin-dashboard/:username" element={<Dashboard />} />
        </Routes>

        {showButton && (
          <div className=" fixed bottom-5 right-5 text-3xl p-2 cursor-pointer justify-center items-center">
            <Button
              type="primary"
              size="large"
              shape="circle"
              onClick={scrollToTop}
            >
              <ArrowUpOutlined />
            </Button>
          </div>
        )}
      </Router>
    </div>
  );
};

export default App;
