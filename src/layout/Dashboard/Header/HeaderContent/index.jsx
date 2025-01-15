// material-ui
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip

// project import
import Profile from './Profile';
import Notification from './Notification';
import { PlusOutlined, PlusSquareFilled, PlusSquareOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';


// ==============================|| HEADER - CONTENT ||============================== //
export default function HeaderContent() {
  const navigate = useNavigate();
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const userRole = userdetails?.[0]?.role_name;

  return (
    <>
      <Box sx={{ width: '100%', ml: 1 }} />
     {userRole !== "Super Admin" && <Tooltip title="Add New Project" arrow>
       <Button style={{ padding: "4px 28px",background: "#00bfa5",color: "white" }} onClick={(e)=>navigate("/createProject")}> <PlusOutlined  style={{ fontSize: "15px", color: "white" }}/> <span style={{marginLeft:"7px"}}>Project</span></Button>
      </Tooltip>}
      <Notification />
      <Profile />
    </>
  );
}
