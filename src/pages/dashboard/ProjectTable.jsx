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
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import { Empty, Spin, Modal } from "antd";

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

function ProjectTableHead({ order, orderBy, onRequestSort }) {
  const headCells = [
    { id: "project_name", label: "Project Name", align: "left", sortable: true },
    { id: "index", label: "Project No", align: "left", sortable: true },
    { id: "runs", label: "No of Iteration", align: "left", sortable: true },
    { id: "last_run", label: "Last Run", align: "left", sortable: true },
    { id: "start_date", label: "Created Date", align: "left", sortable: true },
    { id: "modified_date", label: "Modified Date", align: "left", sortable: true },
    { id: "actions", label: "Actions", align: "center" },
  ];

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '14px' }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
                sx={{
                  '& .MuiTableSortLabel-icon': {
                    opacity: 1,
                  },
                }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

ProjectTableHead.propTypes = {
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};

// ==============================|| PROJECT TABLE ||============================== //

export default function ProjectTable() {
  const navigate = useNavigate();

  const info = JSON.parse(sessionStorage.getItem("userDetails"));
  const userRole = info?.[0]?.role_name;

  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('start_date');

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (orderBy === 'start_date') {
      aValue = a.raw_start_date;
      bValue = b.raw_start_date;
    } else if (orderBy === 'modified_date') {
      aValue = a.raw_modified_date;
      bValue = b.raw_modified_date;
    } else if (orderBy === 'last_run') {
      aValue = a.raw_last_run;
      bValue = b.raw_last_run;
    }

    if (bValue < aValue) {
      return -1;
    }
    if (bValue > aValue) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

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
    raw_start_date,
    raw_modified_date,
    raw_last_run
  ) => {
    return { index, project_no, project_name, start_date, runs, last_run, modified_date, raw_start_date, raw_modified_date, raw_last_run };
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
              project.created_at || "",
              project.updated_at || project.created_at || "",
              project.last_run || ""
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
              project.created_at || "",
              project.updated_at || project.created_at || "",
              project.last_run || ""
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

  const handleDelete = (projectId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this project?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await ProjectApiService.projectDelete(projectId);
          setSnackData({
            show: true,
            message: "Project deleted successfully!",
            type: "success",
          });
          fetchData();
        } catch (error) {
          setSnackData({
            show: true,
            message: error?.message || "Failed to delete project",
            type: "error",
          });
        }
      },
    });
  };

  const handleEdit = (projectId) => {
    navigate(`/projectView/${projectId}`, { state: { project_id: projectId } });
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
              <ProjectTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {stableSort(data, getComparator(order, orderBy)).map((row, index) => (
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
                        <IconButton size="small" onClick={() => handleDelete(row.index)}>
                           <TrashLucideIcon color="#D32F2F" size={17} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEdit(row.index)}>
                           <PenLucideIcon color="#757575" size={17} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleClick(row.index)}>
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

