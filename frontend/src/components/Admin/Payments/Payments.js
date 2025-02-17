import React, { useState, useEffect } from "react";
import { Spin } from "antd";

const Payments = () => {
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
    <div>Payments</div>
  );
};

export default Payments;
