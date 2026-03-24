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
import { Empty } from "antd";

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

// ==============================|| PROJECT TABLE - HEADER ||============================== //

function ProjectTableHead() {
  const headCells = [
    { id: "project_name", label: "Project name", align: "left" },
    { id: "project_no", label: "Project no.", align: "left" },
    { id: "runs", label: "No. of runs", align: "left" },
    { id: "last_run", label: "Last Run", align: "left" },
    { id: "start_date", label: "Created Date", align: "left" },
  ];

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.align}>
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
  ) => {
    return { index, project_no, project_name, start_date, runs, last_run };
  };

  const fetchData = () => {
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
            ),
          );
        }

        setData(newData.slice(0, 6));
      })
      .catch((errResponse) => {
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
        padding: "10px 20px",
        minHeight: "428px",
        alignContent: data.length > 0 ? "normal" : "space-around",
      }}
    >
      <Typography variant="h5">Recent Projectss</Typography>

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

      {data.length > 0 ? (
        viewMode === "list" ? (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <ProjectTableHead />
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Link
                        color="secondary"
                        onClick={() => handleClick(row.index)}
                        sx={{ cursor: "pointer" }}
                      >
                        {row.project_name}
                      </Link>
                    </TableCell>
                    <TableCell>{row.index}</TableCell>
                    <TableCell>{row.runs}</TableCell>
                    <TableCell>
                      {row.last_run}
                    </TableCell>
                    <TableCell>{row.start_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <CardView data={data} gridValue="2" />
        )
      ) : (
        <Empty />
      )}

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

