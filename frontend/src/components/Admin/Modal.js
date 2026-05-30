import React, { useEffect } from "react";
import { Modal, Button, Form, Input, DatePicker, TimePicker, Select } from "antd";
import moment from "moment";

const { Option } = Select;

const GRADES = [
  "Pre-School","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5",
  "Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11",
  "Grade 12","Grade 13",
];

const CustomModal = ({
  visible,
  onCancel,
  onConfirm,
  confirmLoading,
  title,
  content,
  isEditMode,
  isAddMode,
  initialValues,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditMode && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        classDate: initialValues.classDate ? moment(initialValues.classDate) : null,
        classTime: initialValues.classTime ? moment(initialValues.classTime, "HH:mm") : null,
      });
    } else if (isAddMode) {
      form.resetFields();
    }
  }, [isEditMode, isAddMode, initialValues, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const formattedValues = {
          ...values,
          classDate: values.classDate ? values.classDate.format("YYYY-MM-DD") : null,
          classTime: values.classTime ? values.classTime.format("HH:mm") : null,
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
        isEditMode || isAddMode ? (
          <Button key="confirm" type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {isAddMode ? "Add Class" : "Save Changes"}
          </Button>
        ) : (
          <Button key="confirm" type="primary" loading={confirmLoading} onClick={onConfirm}>
            Confirm
          </Button>
        ),
      ]}
      centered
      width={600}
    >
      {isEditMode || isAddMode ? (
        <Form form={form} layout="vertical">
          <Form.Item
            label="Class Name"
            name="className"
            rules={[{ required: true, message: "Please enter class name" }]}
          >
            <Input placeholder="e.g. Grade 10 English — Week 1" />
          </Form.Item>
          <Form.Item
            label="Zoom / Class Link"
            name="classLink"
            rules={[
              { required: true, message: "Please enter the class link" },
              { type: "url", message: "Please enter a valid URL (https://...)" },
            ]}
          >
            <Input placeholder="https://zoom.us/j/..." />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={2} placeholder="What will be covered in this class?" />
          </Form.Item>
          <Form.Item
            label="Class Grade"
            name="classGrade"
            rules={[{ required: true, message: "Please select a grade" }]}
          >
            <Select placeholder="Select Grade">
              {GRADES.map((grade) => (
                <Option key={grade} value={grade}>{grade}</Option>
              ))}
            </Select>
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item
              label="Class Date"
              name="classDate"
              rules={[{ required: true, message: "Please select class date" }]}
              className="flex-1"
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Class Time"
              name="classTime"
              rules={[{ required: true, message: "Please select class time" }]}
              className="flex-1"
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <Form.Item label="Notes / Resources (optional)" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Paste resource links, homework notes, vocabulary lists, etc."
            />
          </Form.Item>
        </Form>
      ) : (
        <div>{content}</div>
      )}
    </Modal>
  );
};

export default CustomModal;
