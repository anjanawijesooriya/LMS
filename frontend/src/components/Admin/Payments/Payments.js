import React, { useState, useEffect } from "react";
import { Table, Input, Spin, Button, notification, Tag, Modal, Form, Image } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import CustomModal from "../Modal";
import axios from "axios";

const { Search } = Input;

const exportToCSV = (data) => {
  const headers = ["First Name", "Last Name", "Student ID", "Month", "Year", "Amount", "Status", "Submitted On"];
  const rows = data.map((p) => [
    p.firstName,
    p.lastName,
    p.studentId,
    p.month,
    p.year || "",
    p.amount,
    p.status,
    p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "payments.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const Payments = ({ onUpdate }) => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [rejectForm] = Form.useForm();
  const [slipPreview, setSlipPreview] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/payments/");
      setData(res.data);
      setFilteredData(res.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSearch = (value) => {
    const v = value.toLowerCase();
    const filtered = data.filter(
      (pay) =>
        pay.firstName.toLowerCase().includes(v) ||
        pay.lastName.toLowerCase().includes(v) ||
        pay.studentId.toLowerCase().includes(v)
    );
    setFilteredData(filtered);
  };

  const handleApprove = (payment) => {
    setActionType("approve");
    setSelectedPayment(payment);
    setModalVisible(true);
  };

  const handleReject = (payment) => {
    setActionType("reject");
    setSelectedPayment(payment);
    rejectForm.resetFields();
    setModalVisible(true);
  };

  const handleModalConfirm = async () => {
    setLoading(true);
    try {
      if (actionType === "approve") {
        await axios.put(`/payments/approve/${selectedPayment._id}`);
        notification.success({ message: "Payment Approved Successfully" });
        await fetchPayments();
        onUpdate();
      } else if (actionType === "reject") {
        const values = await rejectForm.validateFields();
        await axios.put(`/payments/reject/${selectedPayment._id}`, {
          rejectionReason: values.rejectionReason || "",
        });
        notification.success({ message: "Payment Rejected" });
        await fetchPayments();
        onUpdate();
      }
    } catch (error) {
      if (error?.errorFields) return; // form validation error, don't close
      notification.error({ message: `Error: ${actionType === "approve" ? "approving" : "rejecting"} payment` });
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedPayment(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRowKeys.length === 0) return;
    setLoading(true);
    let successCount = 0;
    for (const key of selectedRowKeys) {
      try {
        await axios.put(`/payments/approve/${key}`);
        successCount++;
      } catch {}
    }
    notification.success({ message: `${successCount} payment(s) approved` });
    setSelectedRowKeys([]);
    await fetchPayments();
    onUpdate();
    setLoading(false);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: (record) => ({
      disabled: record.status === "approved" || record.status === "rejected",
    }),
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
    { title: "Student ID", dataIndex: "studentId", key: "studentId" },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      filters: [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December",
      ].map((m) => ({ text: m, value: m })),
      onFilter: (value, record) => record.month === value,
    },
    { title: "Year", dataIndex: "year", key: "year" },
    { title: "Amount (Rs.)", dataIndex: "amount", key: "amount", sorter: (a, b) => a.amount - b.amount },
    { title: "Remarks", dataIndex: "remarks", key: "remarks" },
    {
      title: "Slip",
      dataIndex: "slipImage",
      key: "slipImage",
      render: (url) =>
        url ? (
          <Button size="small" onClick={() => setSlipPreview(url)}>
            View Slip
          </Button>
        ) : (
          <span className="text-gray-400 text-xs">No slip</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Approved", value: "approved" },
        { text: "Pending", value: "pending" },
        { text: "Rejected", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const colors = { approved: "green", pending: "gold", rejected: "red" };
        return (
          <Tag color={colors[status] || "default"}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            onClick={() => handleApprove(record)}
            disabled={record.status !== "pending"}
          >
            <CheckOutlined /> Approve
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            onClick={() => handleReject(record)}
            disabled={record.status !== "pending"}
          >
            <CloseOutlined /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Payments Management</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            icon={<CheckSquareOutlined />}
            disabled={selectedRowKeys.length === 0 || loading}
            onClick={handleBulkApprove}
            type="primary"
          >
            Bulk Approve ({selectedRowKeys.length})
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => exportToCSV(filteredData)}>
            Export CSV
          </Button>
        </div>
      </div>

      <Search
        placeholder="Search by name or student ID"
        enterButton
        allowClear
        onSearch={handleSearch}
        className="mb-4 w-full md:w-1/2"
      />

      {loader ? (
        <center className="mt-20">
          <Spin size="large" />
        </center>
      ) : (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          bordered
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: "max-content" }}
        />
      )}

      {/* Approve / Reject Confirmation Modal */}
      <Modal
        title={actionType === "approve" ? "Approve Payment" : "Reject Payment"}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setSelectedPayment(null); }}
        onOk={handleModalConfirm}
        confirmLoading={loading}
        okText={actionType === "approve" ? "Approve" : "Reject"}
        okButtonProps={{ danger: actionType === "reject" }}
        centered
      >
        {actionType === "approve" ? (
          <p>Are you sure you want to approve this payment from <strong>{selectedPayment?.firstName} {selectedPayment?.lastName}</strong> for <strong>{selectedPayment?.month} {selectedPayment?.year}</strong>?</p>
        ) : (
          <Form form={rejectForm} layout="vertical">
            <p className="mb-3">Rejecting payment for <strong>{selectedPayment?.firstName} {selectedPayment?.lastName}</strong> — <strong>{selectedPayment?.month} {selectedPayment?.year}</strong></p>
            <Form.Item label="Rejection Reason (optional)" name="rejectionReason">
              <Input.TextArea rows={3} placeholder="Enter a reason to inform the student..." />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Slip Image Preview Modal */}
      <Modal
        title="Payment Slip"
        open={!!slipPreview}
        onCancel={() => setSlipPreview(null)}
        footer={null}
        centered
      >
        {slipPreview && (
          <Image src={slipPreview} alt="Payment Slip" style={{ width: "100%" }} />
        )}
      </Modal>
    </div>
  );
};

export default Payments;
