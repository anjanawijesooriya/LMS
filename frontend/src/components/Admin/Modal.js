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
    if (!visible) return;
    if (isEditMode && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        classDate: initialValues.classDate ? moment(initialValues.classDate) : null,
        classTime: initialValues.classTime ? moment(initialValues.classTime, "HH:mm") : null,
      });
    } else if (isAddMode) {
      form.resetFields();
    }
  }, [visible, isEditMode, isAddMode, initialValues, form]);

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
      title={
        <span className="font-poppins font-semibold text-slate-900 dark:text-white">{title}</span>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={confirmLoading} className="rounded-xl">
          Cancel
        </Button>,
        isEditMode || isAddMode ? (
          <Button
            key="confirm"
            type="primary"
            loading={confirmLoading}
            onClick={handleSubmit}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 border-0"
          >
            {isAddMode ? "Add Class" : "Save Changes"}
          </Button>
        ) : (
          <Button
            key="confirm"
            type="primary"
            loading={confirmLoading}
            onClick={onConfirm}
            className="rounded-xl"
          >
            Confirm
          </Button>
        ),
      ]}
      centered
      width={600}
      styles={{ content: { borderRadius: "1.5rem" }, header: { borderRadius: "1.5rem 1.5rem 0 0" } }}
    >
      {isEditMode || isAddMode ? (
        <Form form={form} layout="vertical" className="pt-2">
          <Form.Item
            label={<span className="text-sm font-medium text-slate-700">Class Name</span>}
            name="className"
            rules={[{ required: true, message: "Please enter class name" }]}
          >
            <Input placeholder="e.g. Grade 10 English — Week 1" className="rounded-xl" />
          </Form.Item>
          <Form.Item
            label={<span className="text-sm font-medium text-slate-700">Zoom / Class Link</span>}
            name="classLink"
            rules={[
              { required: true, message: "Please enter the class link" },
              { type: "url", message: "Please enter a valid URL (https://...)" },
            ]}
          >
            <Input placeholder="https://zoom.us/j/..." className="rounded-xl" />
          </Form.Item>
          <Form.Item
            label={<span className="text-sm font-medium text-slate-700">Description</span>}
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={2} placeholder="What will be covered in this class?" className="rounded-xl" />
          </Form.Item>
          <Form.Item
            label={<span className="text-sm font-medium text-slate-700">Class Grade</span>}
            name="classGrade"
            rules={[{ required: true, message: "Please select a grade" }]}
          >
            <Select placeholder="Select Grade" className="rounded-xl">
              {GRADES.map((grade) => (
                <Option key={grade} value={grade}>{grade}</Option>
              ))}
            </Select>
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-slate-700">Class Date</span>}
              name="classDate"
              rules={[{ required: true, message: "Please select class date" }]}
              className="flex-1"
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%", borderRadius: "0.75rem" }} />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-slate-700">Class Time</span>}
              name="classTime"
              rules={[{ required: true, message: "Please select class time" }]}
              className="flex-1"
            >
              <TimePicker format="HH:mm" style={{ width: "100%", borderRadius: "0.75rem" }} />
            </Form.Item>
          </div>
          <Form.Item
            label={<span className="text-sm font-medium text-slate-700">Notes / Resources (optional)</span>}
            name="notes"
          >
            <Input.TextArea
              rows={3}
              placeholder="Paste resource links, homework notes, vocabulary lists, etc."
              className="rounded-xl"
            />
          </Form.Item>
        </Form>
      ) : (
        <div className="py-2 text-slate-700 dark:text-slate-300">{content}</div>
      )}
    </Modal>
  );
};

export default CustomModal;
