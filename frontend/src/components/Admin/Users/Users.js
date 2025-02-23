import React, { useState, useEffect } from "react";
import { Table, Tag, Input, Spin, Button, message, notification } from "antd";
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import CustomModal from "../Modal";
import axios from "axios";

const { Search } = Input;

const Users = () => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/auth/get");
        const students = res.data.filter((user) => user.role === "student");
        setData(students);
        setFilteredData(students);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    })();
  }, []);

  const handleSearch = (value) => {
    const filtered = data.filter((user) =>
      user.email.toLowerCase().includes(value.toLowerCase()) ||
      user.firstName.toLowerCase().includes(value.toLowerCase()) ||
      user.lastName.toLowerCase().includes(value.toLowerCase()) // Added this line
    );
    setFilteredData(filtered);
  };

  console.log(filteredData);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser?._id) {
      notification.error({
        message: "Error",
        description: "Invalid user ID",
      });
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        await axios.delete(`/api/auth/delete/${selectedUser._id}`);
        setData((prevData) =>
          prevData.filter((user) => user._id !== selectedUser._id)
        );
        setFilteredData((prevData) =>
          prevData.filter((user) => user._id !== selectedUser._id)
        );
        notification.success({
          message: "Success",
          description: `${selectedUser.firstName} has been deleted successfully!`,
          placement: "topRight",
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        notification.error({
          message: "Error",
          description: "Error deleting user. Please try again later.",
        });
      } finally {
        setLoading(false);
        setModalVisible(false);
        setSelectedUser(null);
      }
    }, 3000); // Delay for 3 seconds
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
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "StudentID",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "active" },
        { text: "Pending", value: "pending" },
        { text: "Expired", value: "expired" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag
          color={status === "active" ? "green" : "gold"}
          className="flex items-center gap-2"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              status === "active" ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            danger
            size="large"
            onClick={() => handleDeleteClick(record)}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-10 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <Search
        placeholder="Search by email"
        enterButton
        allowClear
        onSearch={handleSearch}
        className="mb-4 w-1/2"
      />
      {loader ? (
        <center className="mt-32">
          <Spin size="large" />
        </center>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          bordered
          pagination={{ pageSize: 10 }}
        />
      )}
      {/* Confirmation Modal */}
      <CustomModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmDelete}
        confirmLoading={loading}
        title="Confirm Deletion"
        content={`Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
      />
    </div>
  );
};

export default Users;
