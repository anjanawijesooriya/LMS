import React, { useState, useEffect } from "react";
import { Table, Input, Spin, Button, notification, Tag } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import CustomModal from "../Modal";
import axios from "axios";

const { Search } = Input;

const Payments = ({ onUpdate }) => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [actionType, setActionType] = useState(null); // Store the action type (approve/reject)
  const [selectedPayment, setSelectedPayment] = useState(null); // Store selected payment

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/payments/");
        const payments = res.data;
        setData(payments);
        setFilteredData(payments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    })();
  }, []);

  const handleSearch = (value) => {
    const filtered = data.filter(
      (pay) =>
        pay.firstName.toLowerCase().includes(value.toLowerCase()) ||
        pay.lastName.toLowerCase().includes(value.toLowerCase()) ||
        pay.studentId.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleApprove = (payment) => {
    setActionType("approve");
    setSelectedPayment(payment);
    setModalVisible(true); // Show modal for approval confirmation
  };

  const handleReject = (payment) => {
    setActionType("reject");
    setSelectedPayment(payment);
    setModalVisible(true); // Show modal for rejection confirmation
  };

  const handleModalConfirm = async () => {
    if (actionType === "approve") {
      // Handle the approval action
      try {
        const response = await axios.put(
          `/payments/approve/${selectedPayment._id}`
        );
        notification.success({ message: "Payment Approved Successfully" });
        // Fetch updated payments list from the backend
        const res = await axios.get("/payments/");
        setData(res.data);
        setFilteredData(res.data);
        //setData(data.filter((item) => item._id !== selectedPayment._id)); // Remove the approved payment from the list
        onUpdate();
        setModalVisible(false);
      } catch (error) {
        notification.error({ message: "Error approving payment" });
      }
    } else if (actionType === "reject") {
      // Handle the rejection action
      try {
        const response = await axios.delete(
          `/payments/reject/${selectedPayment._id}`
        );
        notification.success({ message: "Payment Rejected Successfully" });
        setData((prevData) =>
          prevData.filter((item) => item._id !== selectedPayment._id)
        );
        setFilteredData((prevData) =>
          prevData.filter((item) => item._id !== selectedPayment._id)
        ); // Remove the rejected payment from the list
        onUpdate();
        setModalVisible(false);
      } catch (error) {
        notification.error({ message: "Error rejecting payment" });
      }
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
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: (month) => month,
      // Adding filter functionality for classDate
      filters: [
        { text: "January", value: "January" },
        { text: "February", value: "February" },
        { text: "March", value: "March" },
        { text: "April", value: "April" },
        { text: "May", value: "May" },
        { text: "June", value: "June" },
        { text: "July", value: "July" },
        { text: "August", value: "August" },
        { text: "September", value: "September" },
        { text: "October", value: "October" },
        { text: "November", value: "November" },
        { text: "December", value: "December" },
      ],
      onFilter: (value, record) => record.month === value,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Approved", value: "approved" },
        { text: "Pending", value: "pending" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => (
        <Tag
          color={record.status === "approved" ? "green" : "gold"}
          className="flex items-center gap-2"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              record.status === "approved" ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          {record.status?.replace(/^./, (char) => char.toUpperCase())}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (record) => (
        <>
          <div className="flex gap-2">
            <Button
              type="primary"
              size="medium"
              onClick={() => handleApprove(record)}
              disabled={record.status === "approved"}
            >
              <CheckOutlined /> Approve
            </Button>
            <Button
              type="primary"
              danger
              size="medium"
              onClick={() => handleReject(record)}
              disabled={record.status === "approved"}
            >
              <CloseOutlined /> Reject
            </Button>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="p-10 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Payments Management</h2>
      </div>
      <Search
        placeholder="Search by name or stdId"
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

      {/* Custom Modal for confirmation */}
      <CustomModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleModalConfirm}
        confirmLoading={loading}
        title={actionType === "approve" ? "Approve Payment" : "Reject Payment"}
        content={
          actionType === "approve"
            ? "Are you sure you want to approve this payment?"
            : "Are you sure you want to reject this payment?"
        }
      />
    </div>
  );
};

export default Payments;
