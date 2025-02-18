import { Result, Button } from "antd";
import { Link } from "react-router-dom";

export default () => (
  <div className=" my-52">
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={<Link to="/"><Button type="primary">Back Home</Button></Link>}
    />
  </div>
);