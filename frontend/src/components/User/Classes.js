import React, { useState, useEffect } from "react";
import { Spin } from "antd";

const Classes = () => {
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  });
  return loader ? (
    <center className="mt-80">
      <Spin size="large" />
    </center>
  ) : (
    <div>Classes</div>
  );
};

export default Classes;
