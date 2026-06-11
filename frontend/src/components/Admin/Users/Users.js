import React, { useState, useEffect } from "react";
import { Table, Tag, Input, Spin, Button, notification } from "antd";
import { DeleteOutlined, DownloadOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import CustomModal from "../Modal";
import axios from "axios";

const { Search } = Input;

const exportUsersCSV = (data) => {
  const headers = ["First Name", "Last Name", "Email", "Student ID", "Grade", "Phone", "Membership Status", "Joined"];
  const rows = data.map((u) => [
    u.firstName, u.lastName, u.email, u.studentId, u.grade,
    u.telephoneNumber, u.membership?.status || "pending",
    u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const Users = ({ onUpdate }) => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoader(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/auth/get");
      const students = res.data.filter((u) => u.role === "student");
      setData(students);
      setFilteredData(students);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (value) => {
    const v = value.toLowerCase();
    setFilteredData(
      data.filter(
        (u) =>
          u.email.toLowerCase().includes(v) ||
          u.firstName.toLowerCase().includes(v) ||
          u.lastName.toLowerCase().includes(v) ||
          (u.studentId || "").toLowerCase().includes(v)
      )
    );
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser?._id) return;
    setLoading(true);
    try {
      await axios.delete(`/api/auth/delete/${selectedUser._id}`);
      notification.success({
        message: "User Deleted",
        description: `${selectedUser.firstName} ${selectedUser.lastName} has been removed.`,
      });
      await fetchUsers();
      onUpdate();
    } catch (error) {
      notification.error({ message: "Error deleting user." });
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedUser(null);
    }
  };

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Student ID", dataIndex: "studentId", key: "studentId" },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      filters: ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","Grade 13"].map((g) => ({ text: g, value: g })),
      onFilter: (value, record) => record.grade === value,
    },
    { title: "Phone", dataIndex: "telephoneNumber", key: "telephoneNumber" },
    {
      title: "Membership",
      dataIndex: "membership",
      key: "membership",
      filters: [
        { text: "Active", value: "active" },
        { text: "Pending", value: "pending" },
        { text: "Expired", value: "expired" },
      ],
      onFilter: (value, record) => record.membership?.status === value,
      render: (membership) => {
        const status = membership?.status || "pending";
        const colors = { active: "green", pending: "gold", expired: "red" };
        return <Tag color={colors[status] || "default"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
      },
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteClick(record)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <TeamOutlined className="text-white text-base" />
          </div>
          <div>
            <h2 className="font-poppins font-bold text-slate-900 dark:text-white text-lg leading-tight">Student Management</h2>
            <p className="text-xs text-slate-400">{filteredData.length} students</p>
          </div>
        </div>
        <Button icon={<DownloadOutlined />} onClick={() => exportUsersCSV(filteredData)}>
          Export CSV
        </Button>
      </div>

      <div className="px-6 pt-4 pb-2">
        <Search
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search by name, email or student ID"
          enterButton
          allowClear
          onSearch={handleSearch}
          className="w-full md:w-1/2"
        />
      </div>

      <div className="px-6 pb-6">
        {loader ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading students...</p>
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            bordered={false}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: "max-content" }}
            className="mt-4"
          />
        )}
      </div>

      <CustomModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setSelectedUser(null); }}
        onConfirm={confirmDelete}
        confirmLoading={loading}
        title="Confirm Deletion"
        content={`Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Users;
