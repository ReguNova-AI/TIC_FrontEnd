import PropTypes from "prop-types";
// material-ui
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Empty, Spin } from "antd";

// project import
import { useEffect, useState } from "react";
import { ProjectApiService } from "services/api/ProjectAPIService";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { API_ERROR_MESSAGE } from "shared/constants";
import { formatDate } from "shared/utility";
import CardView from "pages/ProjectListing/CardView";
import ToggleButtons from "pages/ProjectListing/ToggleButton";
import { useNavigate } from "react-router";

const TrashLucideIcon = ({ size = 18, color = "currentColor", strokeWidth = 1.6 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
  </svg>
);

const PenLucideIcon = ({ size = 18, color = "currentColor", strokeWidth = 1.6 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
  </svg>
);

const FileTextLucideIcon = ({ size = 18, color = "currentColor", strokeWidth = 1.6 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" x2="8" y1="13" y2="13"/>
    <line x1="16" x2="8" y1="17" y2="17"/>
    <line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);


// ==============================|| PROJECT TABLE - HEADER ||============================== //

function ProjectTableHead() {
  const headCells = [
    { id: "project_name", label: "Project Name", align: "left" },
    { id: "project_no", label: "Project No", align: "left" },
    { id: "runs", label: "No of Runs", align: "left" },
    { id: "last_run", label: "Last Run", align: "left" },
    { id: "start_date", label: "Created Date", align: "left" },
    { id: "modified_date", label: "Modified Date", align: "left" },
    { id: "actions", label: "Actions", align: "center" },
  ];

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell 
            key={headCell.id} 
            align={headCell.align}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '14px' }}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ==============================|| PROJECT TABLE ||============================== //

export default function ProjectTable() {
  const navigate = useNavigate();

  const info = JSON.parse(sessionStorage.getItem("userDetails"));
  const userRole = info?.[0]?.role_name;

  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isLoading, setIsLoading] = useState(true);

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const createData = (
    index,
    project_no,
    project_name,
    start_date,
    runs,
    last_run,
    modified_date,
  ) => {
    return { index, project_no, project_name, start_date, runs, last_run, modified_date };
  };

  const fetchData = () => {
    setIsLoading(true);
    ProjectApiService.projectListing()
      .then((response) => {
        let newData = [];

        if (userRole === "Org Super Admin" || userRole === "Admin") {
          newData = response?.data?.map((project) =>
            createData(
              project.project_id,
              project.project_no,
              project.project_name,
              project.created_at ? formatDate(project.created_at) : "",
              project.no_of_runs ?? 0,
              project.last_run==="null"||!project.last_run ? "--":project.last_run,
              project.updated_at ? formatDate(project.updated_at) : (project.created_at ? formatDate(project.created_at) : ""),
            ),
          );
        } else {
          newData = response?.data?.details.map((project) =>
            createData(
              project.project_id,
              project.project_no,
              project.project_name,
              project.created_at ? formatDate(project.created_at) : "",
              project.no_of_runs ?? 0,
              project.last_run==="null"||!project.last_run ? "--":project.last_run,
              project.updated_at ? formatDate(project.updated_at) : (project.created_at ? formatDate(project.created_at) : ""),
            ),
          );
        }

        setData(newData.slice(0, 6));
        setIsLoading(false);
      })
      .catch((errResponse) => {
        setIsLoading(false);
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
  };

  const handleClick = (project_id) => {
    navigate(`/projectView/${project_id}`, { state: { project_id } });
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "428px",
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Projects</Typography>
        <Link 
          color="secondary" 
          onClick={() => navigate('/projects')} 
          sx={{ cursor: "pointer", display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#5B0428', fontWeight: 600, fontSize: '14px' }}
        >
          View all {'>'}
        </Link>
      </Box>

      {data.length > 0 &&
        userRole !== "Org Super Admin" &&
        userRole !== "Admin" && (
          <Box sx={{ float: "right" }}>
            <ToggleButtons
              onViewModeChange={handleViewModeChange}
              viewSelected="list"
            />
          </Box>
        )}

      <Spin spinning={isLoading} tip="Loading projects...">
        {data.length > 0 ? (
          viewMode === "list" ? (
            <TableContainer sx={{ overflowX: "auto", bgcolor: 'white', borderRadius: '0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Table>
              <ProjectTableHead />
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} hover sx={{ '& td, & th': { borderBottom: '1px solid #f0f0f0' } }}>
                    <TableCell>
                      <Link
                        onClick={() => handleClick(row.index)}
                        sx={{ cursor: "pointer", color: '#5B0428', fontWeight: 500, textDecoration: 'none', fontSize: '14px' }}
                      >
                        {row.project_name}
                      </Link>
                    </TableCell>
                    <TableCell>{row.index}</TableCell>
                    <TableCell>{row.runs}</TableCell>
                    <TableCell>
                      {row.last_run}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', color: '#555' }}>{row.start_date}</TableCell>
                    <TableCell sx={{ fontSize: '13px', color: '#555' }}>{row.modified_date}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <IconButton size="small">
                           <TrashLucideIcon color="#D32F2F" size={17} />
                        </IconButton>
                        <IconButton size="small">
                           <PenLucideIcon color="#757575" size={17} />
                        </IconButton>
                        <IconButton size="small">
                           <FileTextLucideIcon color="#5B0428" size={17} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <CardView data={data} gridValue="2" />
        )
      ) : !isLoading ? (
        <Empty />
      ) : <Box sx={{ minHeight: '300px' }} />}
      </Spin>

      <Snackbar
        open={snackData.show}
        autoHideDuration={4000}
        onClose={() => setSnackData({ ...snackData, show: false })}
      >
        <Alert severity={snackData.type}>{snackData.message}</Alert>
      </Snackbar>
    </Box>
  );
}

