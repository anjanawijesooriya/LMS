import React, { useState, useEffect } from "react";
import { Table, Input, Button, notification, Tag } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StopOutlined,
  SearchOutlined,
  BookOutlined,
} from "@ant-design/icons";
import CustomModal from "../Modal";
import axiosInstance from "../../../utils/axiosInstance";
import moment from "moment";

const axios = axiosInstance;

const { Search } = Input;

const getClassStatus = (classDate, classTime, isCancelled) => {
  if (isCancelled) return { label: "Cancelled", color: "red" };
  const classDateTime = moment(`${moment(classDate).format("YYYY-MM-DD")} ${classTime}`, "YYYY-MM-DD HH:mm");
  const diffMins = classDateTime.diff(moment(), "minutes");
  if (diffMins > 15) return { label: "Upcoming", color: "blue" };
  if (diffMins >= -90 && diffMins <= 15) return { label: "Live Now", color: "green" };
  return { label: "Ended", color: "default" };
};

const STATUS_FILTERS = [
  { label: "All",       color: "slate",   bg: "bg-slate-100",   border: "border-slate-200",   text: "text-slate-600",   activeBg: "bg-slate-700",   activeText: "text-white" },
  { label: "Upcoming",  color: "blue",    bg: "bg-blue-50",     border: "border-blue-200",    text: "text-blue-700",    activeBg: "bg-blue-600",    activeText: "text-white" },
  { label: "Live Now",  color: "green",   bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-700", activeBg: "bg-emerald-600", activeText: "text-white" },
  { label: "Ended",     color: "default", bg: "bg-slate-100",   border: "border-slate-200",   text: "text-slate-500",   activeBg: "bg-slate-500",   activeText: "text-white" },
  { label: "Cancelled", color: "red",     bg: "bg-red-50",      border: "border-red-200",     text: "text-red-600",     activeBg: "bg-red-500",     activeText: "text-white" },
];

const Classes = ({ onUpdate }) => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isCancelMode, setIsCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoader(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get("/classes/");
      const classes = res.data.data || [];
      setData(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  // Re-apply both filters whenever data, search term, or status filter changes
  useEffect(() => {
    let result = data;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.className?.toLowerCase().includes(q) ||
          c.classGrade?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      result = result.filter(
        (c) => getClassStatus(c.classDate, c.classTime, c.isCancelled).label === statusFilter
      );
    }
    setFilteredData(result);
  }, [data, searchTerm, statusFilter]);

  const handleSearch = (value) => setSearchTerm(value);
  const handleStatusFilter = (label) => setStatusFilter(label);

  const openModal = (engClass, { edit = false, add = false, cancel = false } = {}) => {
    setSelectedClass(engClass);
    setIsEditMode(edit);
    setIsAddMode(add);
    setIsCancelMode(cancel);
    setCancelReason("");
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedClass?._id) return;
    setLoading(true);
    try {
      await axios.delete(`/classes/delete/${selectedClass._id}`);
      notification.success({ message: "Class deleted", description: `"${selectedClass.className}" deleted.` });
      await fetchClasses();
      onUpdate();
    } catch {
      notification.error({ message: "Error deleting class" });
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedClass(null);
    }
  };

  const handleEditSubmit = async (updatedData) => {
    if (!selectedClass?._id) return;
    setLoading(true);
    try {
      const res = await axios.put(`/classes/update/${selectedClass._id}`, updatedData);
      if (res.data.success) {
        await fetchClasses();
        notification.success({ message: "Class updated", description: `"${updatedData.className}" updated.` });
        onUpdate();
      }
    } catch {
      notification.error({ message: "Error updating class" });
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedClass(null);
    }
  };

  const handleAddSubmit = async (newClassData) => {
    setLoading(true);
    try {
      const res = await axios.post("/classes/add", newClassData);
      if (res.data.success) {
        await fetchClasses();
        notification.success({ message: "Class added", description: `"${newClassData.className}" added.` });
        onUpdate();
      }
    } catch (error) {
      notification.error({ message: "Error", description: error.response?.data?.error || "Error adding class." });
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const confirmCancel = async () => {
    if (!selectedClass?._id) return;
    setLoading(true);
    try {
      const res = await axios.put(`/classes/cancel/${selectedClass._id}`, { cancellationReason: cancelReason });
      notification.success({ message: "Class cancelled", description: res.data.message });
      await fetchClasses();
      onUpdate();
    } catch {
      notification.error({ message: "Error cancelling class" });
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedClass(null);
    }
  };

  // Counts always based on full unfiltered data
  const statusCounts = data.reduce((acc, c) => {
    const label = getClassStatus(c.classDate, c.classTime, c.isCancelled).label;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const liveCount = statusCounts["Live Now"] || 0;

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
      filters: ["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => ({ text: m, value: String(i + 1).padStart(2, "0") })),
      onFilter: (value, record) => moment(record.classDate).format("MM") === value,
    },
    {
      title: "Time",
      render: (record) => record?.classTime ? moment(record.classTime, "HH:mm").format("hh:mm A") : "N/A",
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
      render: (notes) => notes
        ? <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{notes}</span>
        : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      title: "Action",
      render: (record) => (
        <div className="flex gap-2 flex-wrap">
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openModal(record, { edit: true })} disabled={record.isCancelled} />
          <Button size="small" icon={<StopOutlined />} onClick={() => openModal(record, { cancel: true })} disabled={record.isCancelled} style={{ borderColor: "#f59e0b", color: "#f59e0b" }}>
            Cancel
          </Button>
          <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={() => openModal(record)} />
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
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
              <BookOutlined className="text-white text-base" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-slate-900 dark:text-white text-lg leading-tight">Classes Management</h2>
              <p className="text-xs text-slate-400">
                {filteredData.length}{filteredData.length !== data.length ? ` of ${data.length}` : ""} classes
              </p>
            </div>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null, { add: true })}>
            New Class
          </Button>
        </div>

        {/* Status filter chips */}
        <div className="flex gap-2 flex-wrap items-center">
          {STATUS_FILTERS.map((f) => {
            const count = f.label === "All" ? data.length : (statusCounts[f.label] || 0);
            const active = statusFilter === f.label;
            return (
              <button
                key={f.label}
                onClick={() => handleStatusFilter(f.label)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 ${
                  active
                    ? `${f.activeBg} ${f.activeText} border-transparent shadow-sm`
                    : `${f.bg} ${f.border} ${f.text} hover:opacity-80`
                }`}
              >
                {f.label === "Live Now" && active && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
                {f.label === "Live Now" && !active && liveCount > 0 && (
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                )}
                {f.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs leading-none ${active ? "bg-white/20" : "bg-black/10"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pt-4 pb-2">
        <Search
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search by class name or grade"
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
              <p className="text-slate-400 text-sm">Loading classes...</p>
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
        onCancel={() => { setModalVisible(false); setSelectedClass(null); }}
        onConfirm={isEditMode ? handleEditSubmit : isAddMode ? handleAddSubmit : isCancelMode ? confirmCancel : confirmDelete}
        confirmLoading={loading}
        title={isEditMode ? "Edit Class" : isAddMode ? "Add New Class" : isCancelMode ? "Cancel Class" : "Confirm Deletion"}
        content={
          isEditMode || isAddMode ? null
          : isCancelMode ? (
            <div>
              <p className="mb-2">Cancel <strong>{selectedClass?.className}</strong>? All enrolled students will be notified.</p>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                rows={3}
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          ) : `Permanently delete "${selectedClass?.className}"? This cannot be undone.`
        }
        isEditMode={isEditMode}
        isAddMode={!isEditMode && isAddMode}
        initialValues={selectedClass}
      />
    </div>
  );
};

export default Classes;
