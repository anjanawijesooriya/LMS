import React, { useEffect } from "react";
import { Modal, Button, Form, Input, DatePicker } from "antd";
import moment from "moment"; // Import for handling date formats

const CustomModal = ({
  visible,
  onCancel,
  onConfirm,
  confirmLoading,
  title,
  content,
  isEditMode,
  initialValues,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditMode && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        classDate: initialValues.classDate
          ? moment(initialValues.classDate)
          : null, // Convert string to moment object
      });
    }
  }, [isEditMode, initialValues, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const formattedValues = {
          ...values,
          classDate: values.classDate
            ? values.classDate.format("YYYY-MM-DD")
            : null, // Convert moment object to string
        };
        onConfirm(formattedValues);
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
        isEditMode ? (
          <Button
            key="confirm"
            type="primary"
            loading={confirmLoading}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        ) : (
          <Button
            key="confirm"
            type="primary"
            loading={confirmLoading}
            onClick={onConfirm}
          >
            Yes
          </Button>
        ),
      ]}
      centered
    >
      {isEditMode ? (
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
        </Form>
      ) : (
        <p>{content}</p>
      )}
    </Modal>
  );
};

export default CustomModal;
