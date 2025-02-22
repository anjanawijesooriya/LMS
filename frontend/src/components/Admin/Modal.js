import React from "react";
import { Modal, Button } from "antd";

const CustomModal = ({ visible, onCancel, onConfirm, confirmLoading, title, content }) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={confirmLoading}>
          No
        </Button>,
        <Button key="confirm" type="primary" loading={confirmLoading} onClick={onConfirm} disabled={confirmLoading}>
          Yes
        </Button>,
      ]}
      centered
    >
      <p>{content}</p>
    </Modal>
  );
};

export default CustomModal;
