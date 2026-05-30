import React, { useState, useEffect } from "react";
import { Table, Tag, Input, Spin, Button, notification } from "antd";
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
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
    const timer = setTimeout(() => setLoader(false), 1500);
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
    const filtered = data.filter(
      (u) =>
        u.email.toLowerCase().includes(v) ||
        u.firstName.toLowerCase().includes(v) ||
        u.lastName.toLowerCase().includes(v) ||
        (u.studentId || "").toLowerCase().includes(v)
    );
    setFilteredData(filtered);
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
        description: `${selectedUser.firstName} ${selectedUser.lastName} deleted.`,
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
    { title: "Grade", dataIndex: "grade", key: "grade",
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
        return (
          <Tag color={colors[status] || "default"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button type="primary" danger size="small" onClick={() => handleDeleteClick(record)}>
          <DeleteOutlined /> Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Student Management</h2>
        <Button icon={<DownloadOutlined />} onClick={() => exportUsersCSV(filteredData)}>
          Export CSV
        </Button>
      </div>
      <Search
        placeholder="Search by name, email or student ID"
        enterButton
        allowClear
        onSearch={handleSearch}
        className="mb-4 w-full md:w-1/2"
      />
      {loader ? (
        <center className="mt-20"><Spin size="large" /></center>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          bordered
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: "max-content" }}
        />
      )}
      <CustomModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setSelectedUser(null); }}
        onConfirm={confirmDelete}
        confirmLoading={loading}
        title="Confirm Deletion"
        content={`Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This cannot be undone.`}
      />
    </div>
  );
};

export default Users;
