import React, { useState, useEffect } from "react";
import { Table, Input, Spin, Button, notification, Tag } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StopOutlined,
} from "@ant-design/icons";
import CustomModal from "../Modal";
import axios from "axios";
import moment from "moment";

const { Search } = Input;

const getClassStatus = (classDate, classTime, isCancelled) => {
  if (isCancelled) return { label: "Cancelled", color: "red" };
  const classDateTime = moment(`${moment(classDate).format("YYYY-MM-DD")} ${classTime}`, "YYYY-MM-DD HH:mm");
  const now = moment();
  const diffMins = classDateTime.diff(now, "minutes");
  if (diffMins > 15) return { label: "Upcoming", color: "blue" };
  if (diffMins >= -90 && diffMins <= 15) return { label: "Live Now", color: "green" };
  return { label: "Ended", color: "default" };
};

const Classes = ({ onUpdate }) => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isCancelMode, setIsCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get("/classes/");
      setData(res.data);
      setFilteredData(res.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleSearch = (value) => {
    const filtered = data.filter((c) =>
      c.className.toLowerCase().includes(value.toLowerCase()) ||
      c.classGrade.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleDeleteClick = (engClass) => {
    setSelectedClass(engClass);
    setIsEditMode(false);
    setIsAddMode(false);
    setIsCancelMode(false);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedClass?._id) return;
    setLoading(true);
    try {
      await axios.delete(`/classes/delete/${selectedClass._id}`);
      notification.success({ message: "Success", description: `${selectedClass.className} deleted.` });
      await fetchClasses();
      onUpdate();
    } catch (error) {
      notification.error({ message: "Error deleting class" });
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedClass(null);
    }
  };

  const handleEditClick = (engClass) => {
    setSelectedClass(engClass);
    setIsEditMode(true);
    setIsAddMode(false);
    setIsCancelMode(false);
    setModalVisible(true);
  };

  const handleEditSubmit = async (updatedData) => {
    if (!selectedClass?._id) return;
    setLoading(true);
    try {
      const response = await axios.put(`/classes/update/${selectedClass._id}`, updatedData);
      if (response.data.success) {
        await fetchClasses();
        notification.success({ message: "Success", description: `${updatedData.className} updated.` });
        onUpdate();
      }
    } catch (error) {
      notification.error({ message: "Error updating class" });
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedClass(null);
    }
  };

  const handleAddClick = () => {
    setSelectedClass(null);
    setIsEditMode(false);
    setIsAddMode(true);
    setIsCancelMode(false);
    setModalVisible(true);
  };

  const handleAddSubmit = async (newClassData) => {
    setLoading(true);
    try {
      const response = await axios.post("/classes/add", newClassData);
      if (response.data.success) {
        await fetchClasses();
        notification.success({ message: "Success", description: `"${newClassData.className}" added.` });
        onUpdate();
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Error adding class.";
      notification.error({ message: "Error", description: msg });
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const handleCancelClick = (engClass) => {
    setSelectedClass(engClass);
    setIsEditMode(false);
    setIsAddMode(false);
    setIsCancelMode(true);
    setCancelReason("");
    setModalVisible(true);
  };

  const confirmCancel = async () => {
    if (!selectedClass?._id) return;
    setLoading(true);
    try {
      const response = await axios.put(`/classes/cancel/${selectedClass._id}`, {
        cancellationReason: cancelReason,
      });
      notification.success({ message: "Class cancelled", description: response.data.message });
      await fetchClasses();
      onUpdate();
    } catch (error) {
      notification.error({ message: "Error cancelling class" });
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedClass(null);
    }
  };

  const handleConfirm = () => {
    if (isEditMode) return handleEditSubmit;
    if (isAddMode) return handleAddSubmit;
    if (isCancelMode) return confirmCancel;
    return confirmDelete;
  };

  const columns = [
    {
      title: "Class Name",
      dataIndex: "className",
      key: "className",
      sorter: (a, b) => a.className.localeCompare(b.className),
    },
    { title: "Grade", dataIndex: "classGrade", key: "classGrade" },
    {
      title: "Date",
      dataIndex: "classDate",
      key: "classDate",
      render: (val) => moment(val).format("DD MMM YYYY"),
      filters: [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December",
      ].map((m, i) => ({ text: m, value: String(i + 1).padStart(2, "0") })),
      onFilter: (value, record) => moment(record.classDate).format("MM") === value,
    },
    {
      title: "Time",
      render: (record) =>
        record?.classTime ? moment(record.classTime, "HH:mm").format("hh:mm A") : "N/A",
    },
    {
      title: "Status",
      render: (record) => {
        const status = getClassStatus(record.classDate, record.classTime, record.isCancelled);
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes) => notes ? <span className="text-xs text-gray-600">{notes}</span> : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      title: "Action",
      render: (record) => (
        <div className="flex gap-2 flex-wrap">
          <Button
            type="primary"
            size="small"
            onClick={() => handleEditClick(record)}
            disabled={record.isCancelled}
          >
            <EditOutlined />
          </Button>
          <Button
            size="small"
            onClick={() => handleCancelClick(record)}
            disabled={record.isCancelled}
            style={{ borderColor: "#f59e0b", color: "#f59e0b" }}
          >
            <StopOutlined /> Cancel
          </Button>
          <Button type="primary" danger size="small" onClick={() => handleDeleteClick(record)}>
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Classes Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClick}>
          New Class
        </Button>
      </div>
      <Search
        placeholder="Search by class name or grade"
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
        onCancel={() => { setModalVisible(false); setSelectedClass(null); }}
        onConfirm={
          isEditMode ? handleEditSubmit
          : isAddMode ? handleAddSubmit
          : isCancelMode ? confirmCancel
          : confirmDelete
        }
        confirmLoading={loading}
        title={
          isEditMode ? "Edit Class"
          : isAddMode ? "Add New Class"
          : isCancelMode ? "Cancel Class"
          : "Confirm Deletion"
        }
        content={
          isEditMode || isAddMode
            ? null
            : isCancelMode
            ? (
              <div>
                <p className="mb-2">Are you sure you want to cancel <strong>{selectedClass?.className}</strong>? All enrolled students will be notified via email.</p>
                <textarea
                  className="w-full border rounded p-2 mt-2 text-sm"
                  rows={3}
                  placeholder="Reason for cancellation (optional)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            )
            : `Are you sure you want to permanently delete "${selectedClass?.className}"?`
        }
        isEditMode={isEditMode}
        isAddMode={!isEditMode && isAddMode}
        initialValues={selectedClass}
      />
    </div>
  );
};

export default Classes;
