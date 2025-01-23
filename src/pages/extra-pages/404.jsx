import React from 'react';
import { Button, Result } from 'antd';
import { useLocation, useParams, useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();
  
return(
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={<Button type="primary" onClick={(e)=>navigate('/')}>Go to Dashboard</Button>}
  />
);
};
export default ErrorPage;