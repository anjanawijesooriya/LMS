import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Spin,
  Card,
  Statistic,
  Carousel,
  List,
  Avatar,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Users from "./Users/Users";
import Classes from "./Online-Classes/Classes";
import Payments from "./Payments/Payments";
import axios from "axios";

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loader, setLoader] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [stdData, setStdData] = useState([]);
  const [clsData, setClsData] = useState([]);
  const [payData, setPayData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/auth/get");
      const students = res.data.filter((user) => user.role === "student");
      setStdData(students);

      const cls = await axios.get("/classes/");
      setClsData(cls.data);

      const payment = await axios.get("/payments/");
      setPayData(payment.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const queryParams = new URLSearchParams(location.search);
  const selectedTab = queryParams.get("tab") || "overview"; // Default to 'overview'

  const handleMenuClick = (key) => {
    navigate(`?tab=${key}`);
  };

  const logoutHandler = () => {
    localStorage.setItem("authToken", null);
    localStorage.removeItem("firstname");
    localStorage.removeItem("lastname");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    navigate("/login");
  };

  const usersCount = stdData.length;
  const clsCount = clsData.length;
  const revenue = payData.reduce((sum, payment) => sum + payment.amount, 0);

  // Simulated Data for Summaries
  const summaryData = {
    users: usersCount,
    classes: clsCount,
    payments: revenue,
  };

  // Get Upcoming Classes closer to today's date
  const today = new Date();
  const upcomingClasses = clsData
    .filter((cls) => new Date(cls.classDate) > today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  // Render Content Based on Query Param
  const renderContent = () => {
    switch (selectedTab) {
      case "users":
        return <Users onUpdate={fetchData} />;
      case "classes":
        return <Classes onUpdate={fetchData} />;
      case "payments":
        return <Payments />;
      case "overview":
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <Card>
              <Statistic
                title="Total Users"
                value={summaryData.users}
                prefix={<UserOutlined />}
              />
            </Card>
            <Card>
              <Statistic
                title="Total Classes"
                value={summaryData.classes}
                prefix={<BookOutlined />}
              />
            </Card>
            <Card>
              <Statistic
                title="Total Revenue"
                value={`Rs.${summaryData.payments}`}
                prefix={<DollarOutlined />}
              />
            </Card>

            {/* Recent Activities */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold mb-4">UpComing Classes</h3>
              <List
                itemLayout="horizontal"
                dataSource={upcomingClasses}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BookOutlined />} />}
                      title={
                        <span className="font-semibold">{item.className}</span>
                      }
                      description={`${new Date(
                        item.classDate
                      ).toLocaleDateString()} at ${item.classTime}`}
                    />
                  </List.Item>
                )}
              />
            </div>

            {/* Image Slider (Optional) */}
            <Carousel autoplay className="md:col-span-3">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1518082593638-b6e73b35d39a?q=80&w=2068&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Slide 1"
                  className="rounded-md shadow-lg w-full"
                />
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Slide 2"
                  className="rounded-md shadow-lg w-full"
                />
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1565022536102-f7645c84354a?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Slide 3"
                  className="rounded-md shadow-lg w-full"
                />
              </div>
            </Carousel>
          </div>
        );
    }
  };

  return loader ? (
    <center className="mt-32">
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
            key="overview"
            icon={<AppstoreOutlined />}
            onClick={() => handleMenuClick("overview")}
          >
            Overview
          </Menu.Item>
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
