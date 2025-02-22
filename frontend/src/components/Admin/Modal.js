import React, { useEffect } from "react";
import { Modal, Button, Form, Input, DatePicker, TimePicker } from "antd";
import moment from "moment";

const CustomModal = ({
  visible,
  onCancel,
  onConfirm,
  confirmLoading,
  title,
  content,
  isEditMode,
  isAddMode, // New prop to determine if it's add mode
  initialValues,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditMode && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        classDate: initialValues.classDate
          ? moment(initialValues.classDate)
          : null, // Convert date string to moment object
        classTime: initialValues.classTime
          ? moment(initialValues.classTime, "HH:mm")
          : null, // Convert time string to moment object
      });
    } else if (isAddMode) {
      form.resetFields(); // Reset form fields for add mode
    }
  }, [isEditMode, isAddMode, initialValues, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const formattedValues = {
          ...values,
          classDate: values.classDate
            ? values.classDate.format("YYYY-MM-DD")
            : null, // Convert date to string
          classTime: values.classTime ? values.classTime.format("HH:mm") : null, // Convert time to string
        };
        onConfirm(formattedValues); // Submit the form data
      })
      .catch((error) => console.error("Validation failed:", error));
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={confirmLoading}>
          Cancel
        </Button>,
        isEditMode || isAddMode ? (
          <Button
            key="confirm"
            type="primary"
            loading={confirmLoading}
            onClick={handleSubmit}
          >
            {isAddMode ? "Add Class" : "Save Changes"}
          </Button>
        ) : (
          <Button
            key="confirm"
            type="primary"
            loading={confirmLoading}
            onClick={onConfirm} // for delete confirmation
          >
            Yes
          </Button>
        ),
      ]}
      centered
    >
      {isEditMode || isAddMode ? (
        <Form form={form} layout="vertical">
          <Form.Item
            label="Class Name"
            name="className"
            rules={[{ required: true, message: "Please enter class name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Class Link"
            name="classLink"
            rules={[{ required: true, message: "Please enter class link" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Class Date"
            name="classDate"
            rules={[{ required: true, message: "Please select class date" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Class Time"
            name="classTime"
            rules={[{ required: true, message: "Please select class time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      ) : (
        <p>{content}</p> // Display deletion confirmation content
      )}
    </Modal>
  );
};

export default CustomModal;