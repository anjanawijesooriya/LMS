import React, { useState, useEffect } from "react";
import { Table, Input, Button, notification, Tag, Modal, Form, Image } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  CheckSquareOutlined,
  SearchOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import CustomModal from "../Modal";
import axiosInstance from "../../../utils/axiosInstance";
const axios = axiosInstance;

const { Search } = Input;

const exportToCSV = (data) => {
  const headers = ["First Name", "Last Name", "Student ID", "Month", "Year", "Amount", "Status", "Submitted On"];
  const rows = data.map((p) => [
    p.firstName, p.lastName, p.studentId, p.month, p.year || "",
    p.amount, p.status,
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
    const timer = setTimeout(() => setLoader(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/payments/");
      const payments = res.data.data || [];
      setData(payments);
      setFilteredData(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleSearch = (value) => {
    const v = value.toLowerCase();
    setFilteredData(
      data.filter(
        (pay) =>
          pay.firstName.toLowerCase().includes(v) ||
          pay.lastName.toLowerCase().includes(v) ||
          pay.studentId.toLowerCase().includes(v)
      )
    );
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
      if (error?.errorFields) return;
      notification.error({ message: `Error ${actionType === "approve" ? "approving" : "rejecting"} payment` });
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

  const pendingCount = data.filter((p) => p.status === "pending").length;
  const approvedCount = data.filter((p) => p.status === "approved").length;
  const totalApproved = data.filter((p) => p.status === "approved").reduce((s, p) => s + p.amount, 0);

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
      filters: ["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => ({ text: m, value: m })),
      onFilter: (value, record) => record.month === value,
    },
    { title: "Year", dataIndex: "year", key: "year" },
    {
      title: "Amount (Rs.)",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (v) => `Rs. ${v?.toLocaleString()}`,
    },
    { title: "Remarks", dataIndex: "remarks", key: "remarks" },
    {
      title: "Slip",
      dataIndex: "slipImage",
      key: "slipImage",
      render: (url) =>
        url ? (
          <button
            className="text-xs text-indigo-600 hover:underline font-medium"
            onClick={() => setSlipPreview(url)}
          >
            View
          </button>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
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
        return <Tag color={colors[status] || "default"}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</Tag>;
      },
    },
    {
      title: "Action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)} disabled={record.status !== "pending"}>
            Approve
          </Button>
          <Button type="primary" danger size="small" icon={<CloseOutlined />} onClick={() => handleReject(record)} disabled={record.status !== "pending"}>
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
              <DollarOutlined className="text-white text-base" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-slate-900 dark:text-white text-lg leading-tight">Payments Management</h2>
              <p className="text-xs text-slate-400">{filteredData.length} records</p>
            </div>
          </div>
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

        {/* Summary chips */}
        <div className="flex gap-3 flex-wrap">
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-xs text-amber-700 font-medium">{pendingCount} pending</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-xs text-emerald-700 font-medium">{approvedCount} approved</span>
          </div>
          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2">
            <span className="text-xs text-indigo-700 font-medium">Rs. {totalApproved.toLocaleString()} collected</span>
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 pb-2">
        <Search
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search by name or student ID"
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
              <p className="text-slate-400 text-sm">Loading payments...</p>
            </div>
          </div>
        ) : (
          <Table
            rowSelection={rowSelection}
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

      {/* Approve / Reject Modal */}
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
          <p>Approve payment from <strong>{selectedPayment?.firstName} {selectedPayment?.lastName}</strong> for <strong>{selectedPayment?.month} {selectedPayment?.year}</strong>?</p>
        ) : (
          <Form form={rejectForm} layout="vertical">
            <p className="mb-3">Rejecting payment for <strong>{selectedPayment?.firstName} {selectedPayment?.lastName}</strong> — <strong>{selectedPayment?.month} {selectedPayment?.year}</strong></p>
            <Form.Item label="Rejection Reason (optional)" name="rejectionReason">
              <Input.TextArea rows={3} placeholder="Enter a reason to inform the student..." />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Slip Preview Modal */}
      <Modal
        title="Payment Slip"
        open={!!slipPreview}
        onCancel={() => setSlipPreview(null)}
        footer={null}
        centered
      >
        {slipPreview && <Image src={slipPreview} alt="Payment Slip" style={{ width: "100%" }} />}
      </Modal>
    </div>
  );
};

export default Payments;
