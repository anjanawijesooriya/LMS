import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layout, Menu, Button, Badge } from "antd";
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
import { motion } from "framer-motion";
import Users from "./Users/Users";
import Classes from "./Online-Classes/Classes";
import Payments from "./Payments/Payments";
import ClassCalendar from "./ClassCalendar";
import axiosInstance from "../../utils/axiosInstance";
import moment from "moment";
import { selectAuthState } from "../../redux/features/auth/authSelectors";
import { logoutUser } from "../../redux/features/auth/authActions";

const axios = axiosInstance;


const { Sider, Content } = Layout;

const statCards = [
  { key: "totalStudents", icon: "👥", label: "Total Students", color: "from-blue-500 to-cyan-500" },
  { key: "activeMembers", icon: "✅", label: "Active Members", color: "from-emerald-500 to-teal-500" },
  { key: "pendingPayments", icon: "⏳", label: "Pending Payments", color: "from-amber-500 to-orange-500" },
  { key: "totalClasses", icon: "📚", label: "Total Classes", color: "from-violet-500 to-purple-500" },
  { key: "totalRevenue", icon: "💰", label: "Total Revenue", color: "from-indigo-500 to-blue-500", prefix: "Rs. " },
  { key: "monthlyRevenue", icon: "📈", label: "This Month", color: "from-rose-500 to-pink-500", prefix: "Rs. " },
];

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
    const timer = setTimeout(() => setLoader(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [usersRes, clsRes, payRes] = await Promise.all([
        axios.get("/api/auth/get"),
        axios.get("/classes/?limit=1000"),
        axios.get("/payments/"),
      ]);
      setStdData((usersRes.data.data || []).filter((u) => u.role === "student"));
      setClsData(clsRes.data.data || []);
      setPayData(payRes.data.data || []);
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

  const totalStudents = stdData.length;
  const activeMembers = stdData.filter((s) => s.membership?.status === "active").length;
  const pendingPayments = payData.filter((p) => p.status === "pending").length;
  const totalRevenue = payData.filter((p) => p.status === "approved").reduce((s, p) => s + p.amount, 0);
  const currentMonth = moment().format("MMMM");
  const currentYear = moment().year();
  const monthlyRevenue = payData
    .filter((p) => p.status === "approved" && p.month === currentMonth && p.year === currentYear)
    .reduce((s, p) => s + p.amount, 0);

  const statsValues = {
    totalStudents,
    activeMembers,
    pendingPayments,
    totalClasses: clsData.length,
    totalRevenue: totalRevenue.toLocaleString(),
    monthlyRevenue: monthlyRevenue.toLocaleString(),
  };

  const upcomingClasses = clsData
    .filter((c) => {
      if (c.isCancelled) return false;
      const dateStr = moment(c.classDate).format("YYYY-MM-DD");
      const end = moment(`${dateStr} ${c.classTime}`, "YYYY-MM-DD HH:mm").add(90, "minutes");
      return end.isAfter(moment());
    })
    .sort((a, b) => new Date(a.classDate) - new Date(b.classDate))
    .slice(0, 5);

  const recentPendingPayments = payData.filter((p) => p.status === "pending").slice(0, 5);

  const menuItems = [
    { key: "overview", icon: <AppstoreOutlined />, label: "Overview" },
    { key: "users", icon: <UserOutlined />, label: "Users" },
    { key: "classes", icon: <BookOutlined />, label: "Classes" },
    {
      key: "payments",
      icon: (
        <Badge count={pendingPayments} size="small" offset={[6, 0]}>
          <DollarOutlined />
        </Badge>
      ),
      label: "Payments",
    },
  ];

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
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statCards.map(({ key, icon, label, color, prefix }) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * statCards.findIndex((s) => s.key === key) }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm`}>
                    {icon}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">{label}</p>
                  <p className="font-poppins font-bold text-2xl text-slate-900 dark:text-white">
                    {prefix || ""}{statsValues[key]}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Classes */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <BookOutlined className="text-white text-sm" />
                  </div>
                  <h3 className="font-poppins font-semibold text-slate-900 dark:text-white">Upcoming Classes</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {upcomingClasses.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">No upcoming classes</div>
                  ) : (
                    upcomingClasses.map((item) => (
                      <div key={item._id} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BookOutlined className="text-indigo-600 dark:text-indigo-400 text-sm" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{item.className}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {moment(item.classDate).format("DD MMM YYYY")} · {moment(item.classTime, "HH:mm").format("hh:mm A")}
                            <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs">{item.classGrade}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Payments */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <ClockCircleOutlined className="text-white text-sm" />
                    </div>
                    <h3 className="font-poppins font-semibold text-slate-900 dark:text-white">
                      Pending Payments
                      {pendingPayments > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">{pendingPayments}</span>
                      )}
                    </h3>
                  </div>
                  <button
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    onClick={() => handleMenuClick("payments")}
                  >
                    View all →
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {recentPendingPayments.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">No pending payments</div>
                  ) : (
                    recentPendingPayments.map((item) => (
                      <div key={item._id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0 font-poppins font-bold text-amber-600 dark:text-amber-400 text-sm">
                          {item.firstName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {item.firstName} {item.lastName}
                            <span className="ml-2 text-xs text-slate-400">({item.studentId})</span>
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.month} {item.year} — Rs. {item.amount?.toLocaleString()}
                          </p>
                        </div>
                        <CheckCircleOutlined
                          className="text-slate-300 hover:text-emerald-500 cursor-pointer transition-colors text-lg"
                          onClick={() => handleMenuClick("payments")}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Class Schedule Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ClassCalendar classes={clsData} />
            </motion.div>
          </div>
        );
    }
  };

  if (loader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-poppins text-slate-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen">
      {/* Sider */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)" }}
        className="shadow-2xl"
        width={220}
      >
        {/* Logo */}
        <div className={`flex items-center justify-center py-5 px-4 border-b border-white/10 ${collapsed ? "py-5" : ""}`}>
          {collapsed ? (
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center font-poppins font-bold text-white text-sm">D</div>
          ) : (
            <div className="font-poppins font-bold text-transparent bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-lg leading-tight">
              Devians ✦ LMS
              <div className="text-xs text-indigo-400 font-normal mt-0.5">Admin Panel</div>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedTab]}
          style={{ background: "transparent", borderRight: "none", marginTop: 8 }}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => handleMenuClick(item.key),
            style: {
              color: selectedTab === item.key ? "#a5b4fc" : "#94a3b8",
              backgroundColor: selectedTab === item.key ? "rgba(99,102,241,0.15)" : "transparent",
              borderRadius: "0.75rem",
              margin: "2px 8px",
              width: "calc(100% - 16px)",
            },
          }))}
        />

        {/* Logout button at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <button
            className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 transition-all duration-200 text-sm`}
            onClick={logoutHandler}
          >
            <LogoutOutlined />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </Sider>

      <Layout style={{ background: "#f8fafc" }}>
        {/* Header */}
        <div className="sticky top-0 z-30 glass-nav px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-600"
            />
            <div>
              <p className="font-poppins font-bold text-slate-900 dark:text-white leading-tight capitalize">
                {selectedTab === "overview" ? "Dashboard Overview" : selectedTab}
              </p>
              <p className="text-xs text-slate-400">{moment().format("dddd, DD MMMM YYYY")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingPayments > 0 && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-medium hover:bg-amber-100 transition-colors"
                onClick={() => handleMenuClick("payments")}
              >
                <ClockCircleOutlined />
                {pendingPayments} pending
              </button>
            )}
            <div className="flex items-center gap-2.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-700/50">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-poppins font-bold text-xs">
                {user?.firstName?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {user?.firstName}
              </span>
            </div>
          </div>
        </div>

        <Content className="p-6 overflow-auto">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
