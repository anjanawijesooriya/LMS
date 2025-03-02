import React, { useState, useEffect } from "react";
import { Table, Input, Spin, Button, notification } from "antd";
import {
  DeleteOutlined,
  LoadingOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import CustomModal from "../Modal";
import axios from "axios";
import moment from "moment";

const { Search } = Input;

const Payments = () => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

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
      title: "Action",
      render: (record) => (
        <>
          <div className="flex gap-2">
            <Button
              type="primary"
              size="medium"
              // onClick={() => handleEditClick(record)}
            >
              <CheckOutlined /> Approve
            </Button>
            <Button
              type="primary"
              danger
              size="medium"
              // onClick={() => handleDeleteClick(record)}
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
    </div>
  );
};

export default Payments;
