import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Users from "./Users/Users";
import Classes from "./Online-Classes/Classes";
import Payments from "./Payments/Payments";

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loader, setLoader] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  });

  // Get the tab from query params
  const queryParams = new URLSearchParams(location.search);
  const selectedTab = queryParams.get("tab") || "users"; // Default to 'users'

  // Update URL when tab is clicked
  const handleMenuClick = (key) => {
    navigate(`?tab=${key}`);
  };

  // Render content based on query param
  const renderContent = () => {
    switch (selectedTab) {
      case "users":
        return <Users />;
      case "classes":
        return <Classes />;
      case "payments":
        return <Payments />;
      default:
        return <Users />;
    }
  };

  //logout
  const logoutHandler = () => {
    localStorage.setItem("authToken", null);
    localStorage.removeItem("firstname");
    localStorage.removeItem("lastname");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return loader ? (
    <center className="mt-80">
      <Spin size="large" />
    </center>
  ) : (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-gray-900"
      >
        <div className="p-4 text-white text-lg text-center font-bold">
          Admin Panel
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedTab]}>
          <Menu.Item
            key="users"
            icon={<UserOutlined />}
            onClick={() => handleMenuClick("users")}
          >
            Users
          </Menu.Item>
          <Menu.Item
            key="classes"
            icon={<BookOutlined />}
            onClick={() => handleMenuClick("classes")}
          >
            Classes
          </Menu.Item>
          <Menu.Item
            key="payments"
            icon={<DollarOutlined />}
            onClick={() => handleMenuClick("payments")}
          >
            Payments
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        {/* Header */}
        <Header className="bg-white shadow-md flex items-center justify-between px-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={logoutHandler}
          >
            Logout
          </Button>
        </Header>

        {/* Main Content */}
        <Content className="m-4 p-4 bg-white shadow-md rounded-lg">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
