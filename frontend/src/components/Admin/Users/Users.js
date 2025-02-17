import React, { useState, useEffect } from "react";
import { Spin } from "antd";

const Users = () => {
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  });
  return loader ? (
    <center className="mt-64">
      <Spin size="large" />
    </center>
  ) : (
    <div>Users</div>
  );
};

export default Users;
