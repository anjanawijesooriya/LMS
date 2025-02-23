import React, { useState, useEffect } from "react";
import { Table, Input, Spin, Button, notification } from "antd";
import {
  DeleteOutlined,
  LoadingOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import CustomModal from "../Modal";
import axios from "axios";
import moment from "moment";

const { Search } = Input;

const Classes = ({ onUpdate }) => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/classes/");
        const classes = res.data;
        setData(classes);
        setFilteredData(classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    })();
  }, []);

  const handleSearch = (value) => {
    const filtered = data.filter((engClass) =>
      engClass.className.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  console.log(filteredData);

  const handleDeleteClick = (engClass) => {
    setSelectedClass(engClass);
    setIsEditMode(false);
    setIsAddMode(false);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedClass?._id) {
      notification.error({
        message: "Error",
        description: "Invalid class ID",
      });
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        await axios.delete(`/classes/delete/${selectedClass._id}`);
        setData((prevData) =>
          prevData.filter((engClass) => engClass._id !== selectedClass._id)
        );
        setFilteredData((prevData) =>
          prevData.filter((engClass) => engClass._id !== selectedClass._id)
        );
        notification.success({
          message: "Success",
          description: `${selectedClass.className} has been deleted successfully!`,
          placement: "topRight",
        });
        onUpdate();
      } catch (error) {
        console.error("Error deleting user:", error);
        notification.error({
          message: "Error",
          description: "Error deleting user. Please try again later.",
        });
      } finally {
        setLoading(false);
        setModalVisible(false);
        setSelectedClass(null);
      }
    }, 3000); // Delay for 3 seconds
  };

  const handleEditClick = (engClass) => {
    setSelectedClass(engClass);
    setIsEditMode(true);
    setModalVisible(true);
  };

  const handleEditSubmit = async (updatedData) => {
    if (!selectedClass?._id) return;

    setLoading(true);
    setTimeout(async () => {
      try {
        const response = await axios.put(
          `/classes/update/${selectedClass._id}`,
          updatedData
        );
        if (response.data.success) {
          setData((prevData) =>
            prevData.map((item) =>
              item._id === selectedClass._id
                ? { ...item, ...updatedData }
                : item
            )
          );
          setFilteredData((prevData) =>
            prevData.map((item) =>
              item._id === selectedClass._id
                ? { ...item, ...updatedData }
                : item
            )
          );

          notification.success({
            message: "Success",
            description: `${updatedData.className} has been updated successfully!`,
            placement: "topRight",
          });
        }
      } catch (error) {
        console.error("Error updating class:", error);
        notification.error({
          message: "Error",
          description: "Error updating class. Please try again later.",
        });
      } finally {
        setLoading(false);
        setModalVisible(false);
        setSelectedClass(null);
      }
    }, 3000);
  };

  const handleAddClick = () => {
    setSelectedClass(null);
    setIsEditMode(false);
    setIsAddMode(true);
    setModalVisible(true);
  };

  const handleAddSubmit = async (newClassData) => {
    setLoading(true);

    try {
      const response = await axios.post("/classes/add", newClassData);

      if (response.data.success) {
        // Re-fetch all classes after adding the new one
        const res = await axios.get("/classes/");
        const classes = res.data;
        setData(classes);
        setFilteredData(classes);

        // Display success notification
        notification.success({
          message: "Success",
          description: `Class "${newClassData.className}" added successfully!`,
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Error adding class:", error);
      notification.error({
        message: "Error",
        description: "Error adding class. Please try again later.",
      });
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const columns = [
    {
      title: "Class Name",
      dataIndex: "className",
      key: "className",
      sorter: (a, b) => a.className.localeCompare(b.className),
    },
    {
      title: "Class Link",
      dataIndex: "classLink",
      key: "classLink",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Class Grade",
      dataIndex: "classGrade",
      key: "classGrade",
    },
    {
      title: "Class Date",
      dataIndex: "classDate",
      key: "classDate",
      render: (record) => <>{moment(record).format("DD MMM YYYY")}</>,
      // Adding filter functionality for classDate
      filters: [
        { text: "January", value: "01" },
        { text: "February", value: "02" },
        { text: "March", value: "03" },
        { text: "April", value: "04" },
        { text: "May", value: "05" },
        { text: "June", value: "06" },
        { text: "July", value: "07" },
        { text: "August", value: "08" },
        { text: "September", value: "09" },
        { text: "October", value: "10" },
        { text: "November", value: "11" },
        { text: "December", value: "12" },
      ],
      onFilter: (value, record) => {
        const recordMonth = moment(record.classDate).format("MM"); // Ensure it's a moment object and formatted as MM
        return recordMonth === value;
      },
    },
    {
      title: "Class Time",
      render: (record) => (
        <>
          {record?.classTime
            ? moment(record?.classTime, "HH:mm").format("hh:mm A") // Convert 24-hour time to 12-hour format
            : "N/A"}
        </>
      ),
    },
    {
      title: "Action",
      render: (record) => (
        <>
          <div className="flex gap-2">
            <Button
              type="primary"
              size="large"
              onClick={() => handleEditClick(record)}
            >
              <EditOutlined />
            </Button>
            <Button
              type="primary"
              danger
              size="large"
              onClick={() => handleDeleteClick(record)}
            >
              <DeleteOutlined />
            </Button>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="p-10 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Classes Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClick}>
          New Class
        </Button>
      </div>
      <Search
        placeholder="Search by classname"
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
        onConfirm={
          isEditMode
            ? handleEditSubmit
            : isAddMode
            ? handleAddSubmit
            : confirmDelete
        }
        confirmLoading={loading}
        title={
          isEditMode
            ? "Edit Class"
            : isAddMode
            ? "Add Class"
            : "Confirm Deletion"
        }
        content={
          isEditMode || isAddMode
            ? null
            : `Are you sure you want to delete ${selectedClass?.className}?`
        }
        isEditMode={isEditMode}
        isAddMode={!isEditMode && !selectedClass} // Pass add mode flag when no class is selected
        initialValues={selectedClass}
      />
    </div>
  );
};

export default Classes;
