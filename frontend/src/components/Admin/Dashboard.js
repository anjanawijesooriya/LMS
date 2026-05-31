import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Layout,
  Menu,
  Button,
  Spin,
  Card,
  Statistic,
  List,
  Avatar,
  Tag,
  Badge,
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
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Users from "./Users/Users";
import Classes from "./Online-Classes/Classes";
import Payments from "./Payments/Payments";
import axios from "axios";
import moment from "moment";

import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loader, setLoader] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [stdData, setStdData] = useState([]);
  const [clsData, setClsData] = useState([]);
  const [payData, setPayData] = useState([]);

  const dispatch = useDispatch();
  const { user } = useSelector(selectAuthState);

  useEffect(() => {
    const timer = setTimeout(() => setLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [usersRes, clsRes, payRes] = await Promise.all([
        axios.get("/api/auth/get"),
        axios.get("/classes/"),
        axios.get("/payments/"),
      ]);
      setStdData(usersRes.data.filter((u) => u.role === "student"));
      setClsData(clsRes.data);
      setPayData(payRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const queryParams = new URLSearchParams(location.search);
  const selectedTab = queryParams.get("tab") || "overview";

  const handleMenuClick = (key) => navigate(`?tab=${key}`);

  const logoutHandler = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  // Analytics
  const totalStudents = stdData.length;
  const activeMembers = stdData.filter((s) => s.membership?.status === "active").length;
  const pendingPayments = payData.filter((p) => p.status === "pending").length;
  const totalRevenue = payData
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.amount, 0);

  const currentMonth = moment().format("MMMM");
  const currentYear = moment().year();
  const monthlyRevenue = payData
    .filter((p) => p.status === "approved" && p.month === currentMonth && p.year === currentYear)
    .reduce((sum, p) => sum + p.amount, 0);

  const today = new Date();
  const upcomingClasses = clsData
    .filter((cls) => new Date(cls.classDate) > today && !cls.isCancelled)
    .sort((a, b) => new Date(a.classDate) - new Date(b.classDate))
    .slice(0, 5);

  const recentPayments = payData
    .filter((p) => p.status === "pending")
    .slice(0, 5);

  const renderContent = () => {
    switch (selectedTab) {
      case "users":
        return <Users onUpdate={fetchData} />;
      case "classes":
        return <Classes onUpdate={fetchData} />;
      case "payments":
        return <Payments onUpdate={fetchData} />;
      case "overview":
      default:
        return (
          <div className="space-y-6">
            {/* Stats Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <Statistic
                  title="Total Students"
                  value={totalStudents}
                  prefix={<TeamOutlined className="text-blue-500" />}
                />
              </Card>
              <Card>
                <Statistic
                  title="Active Memberships"
                  value={activeMembers}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                  valueStyle={{ color: "#22c55e" }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Pending Payments"
                  value={pendingPayments}
                  prefix={<ClockCircleOutlined className="text-yellow-500" />}
                  valueStyle={{ color: pendingPayments > 0 ? "#f59e0b" : undefined }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Total Classes"
                  value={clsData.length}
                  prefix={<BookOutlined className="text-purple-500" />}
                />
              </Card>
            </div>

            {/* Stats Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={`Rs.${totalRevenue.toLocaleString()}`}
                  prefix={<DollarOutlined className="text-blue-600" />}
                />
              </Card>
              <Card>
                <Statistic
                  title={`Revenue — ${currentMonth} ${currentYear}`}
                  value={`Rs.${monthlyRevenue.toLocaleString()}`}
                  prefix={<DollarOutlined className="text-emerald-600" />}
                  valueStyle={{ color: "#059669" }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Upcoming Classes"
                  value={upcomingClasses.length}
                  prefix={<BookOutlined className="text-indigo-500" />}
                />
              </Card>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Classes */}
              <Card title="Upcoming Classes" className="shadow-sm">
                <List
                  itemLayout="horizontal"
                  dataSource={upcomingClasses}
                  locale={{ emptyText: "No upcoming classes" }}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<BookOutlined />} style={{ backgroundColor: "#6366f1" }} />}
                        title={<span className="font-semibold">{item.className}</span>}
                        description={
                          <span>
                            {moment(item.classDate).format("DD MMM YYYY")} at {moment(item.classTime, "HH:mm").format("hh:mm A")}
                            {" — "}<Tag color="blue">{item.classGrade}</Tag>
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* Pending Payments */}
              <Card
                title={
                  <span>
                    Pending Payments{" "}
                    {pendingPayments > 0 && <Badge count={pendingPayments} style={{ backgroundColor: "#f59e0b" }} />}
                  </span>
                }
                className="shadow-sm"
                extra={
                  <Button size="small" onClick={() => handleMenuClick("payments")}>
                    View All
                  </Button>
                }
              >
                <List
                  itemLayout="horizontal"
                  dataSource={recentPayments}
                  locale={{ emptyText: "No pending payments" }}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: "#f59e0b" }} />}
                        title={<span>{item.firstName} {item.lastName} <span className="text-gray-400 text-xs">({item.studentId})</span></span>}
                        description={`${item.month} ${item.year} — Rs.${item.amount}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </div>
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
      <Sider trigger={null} collapsible collapsed={collapsed} className="bg-gray-900">
        <div className="p-4 text-white text-center font-bold">
          {collapsed ? "A" : "Admin Panel"}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedTab]}>
          <Menu.Item key="overview" icon={<AppstoreOutlined />} onClick={() => handleMenuClick("overview")}>
            Overview
          </Menu.Item>
          <Menu.Item key="users" icon={<UserOutlined />} onClick={() => handleMenuClick("users")}>
            Users
          </Menu.Item>
          <Menu.Item key="classes" icon={<BookOutlined />} onClick={() => handleMenuClick("classes")}>
            Classes
          </Menu.Item>
          <Menu.Item
            key="payments"
            icon={
              <Badge count={pendingPayments} size="small" offset={[8, 0]}>
                <DollarOutlined />
              </Badge>
            }
            onClick={() => handleMenuClick("payments")}
          >
            Payments
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header className="bg-white shadow-md flex items-center justify-between px-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <span className="font-semibold text-gray-600">
            Welcome, {user?.firstName}
          </span>
          <Button type="primary" icon={<LogoutOutlined />} onClick={logoutHandler}>
            Logout
          </Button>
        </Header>

        <Content className="m-4 p-4 bg-gray-50 rounded-lg">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
