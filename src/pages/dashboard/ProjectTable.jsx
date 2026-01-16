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

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// ==============================|| PROJECT TABLE - HEADER ||============================== //

function ProjectTableHead({ order, orderBy }) {
  const headCells = [
    {
      id: "project_name",
      align: "left",
      disablePadding: false,
      label: "Project name",
    },
    {
      id: "project_no",
      align: "left",
      disablePadding: true,
      label: "Project no.",
    },
    {
      id: "start_date",
      align: "left",
      disablePadding: false,
      label: "Created Date",
    },
  ];

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
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
  const order = "asc";
  const orderBy = "index";
  const navigate = useNavigate();
  let info = JSON.parse(sessionStorage.getItem("userDetails"));
  const userRole = info?.[0]?.role_name;

  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState(
    userRole !== "Org Super Admin" && userRole !== "Admin" ? "card" : "list"
  );
  const [loading, setLoading] = useState(true);

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const createData = (index, project_no, project_name, start_date) => {
    return { index, project_no, project_name, start_date };
  };

  const fetchData = () => {
    ProjectApiService.projectListing()
      .then((response) => {
        let newData = null;

        if (userRole === "Org Super Admin" || userRole === "Admin") {
          newData = response?.data?.map((project, index) =>
            createData(
              project.project_id, // index
              project.project_no, // project_no
              project.project_name, // project_name
              project.created_at !== "null" &&
                project.created_at !== "" &&
                project.created_at !== null
                ? formatDate(project.created_at)
                : "" // start_date
            )
          );
        } else {
          newData = response?.data?.details.map((project, index) =>
            createData(
              project.project_id,
              project.project_no,
              project.project_name,
              project.created_at !== "null" &&
                project.created_at !== "" &&
                project.created_at !== null
                ? formatDate(project.created_at)
                : ""
            )
          );
        }

        const limitedData = newData.slice(0, 6);
        setData(limitedData);
        setLoading(false);
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
        setLoading(false);
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
      style={{
        padding: "10px 20px",
        minHeight: "428px",
        alignContent: data.length > 0 ? "normal" : "space-around",
      }}
    >
      <Typography variant="h5">Recent Projects</Typography>
      {data.length > 0 &&
        userRole !== "Org Super Admin" &&
        userRole !== "Admin" && (
          <Box style={{ float: "right" }}>
            <ToggleButtons
              onViewModeChange={handleViewModeChange}
              viewSelected="card"
            />
          </Box>
        )}
      {data.length > 0 ? (
        viewMode === "list" ? (
          <TableContainer
            sx={{
              width: "100%",
              overflowX: "auto",
              position: "relative",
              display: "block",
              maxWidth: "100%",
              "& td, & th": { whiteSpace: "nowrap" },
            }}
          >
            <Table aria-labelledby="tableTitle">
              <ProjectTableHead order={order} orderBy={orderBy} />
              <TableBody>
                {stableSort(data, getComparator(order, orderBy)).map(
                  (row, index) => {
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                        tabIndex={-1}
                        key={row.project_name}
                      >
                        <TableCell component="th" id={labelId} scope="row">
                          <Link
                            color="secondary"
                            onClick={() => handleClick(row.index)}
                            style={{ cursor: "pointer" }}
                          >
                            {row.project_name}
                          </Link>
                        </TableCell>
                        <TableCell>{row.project_no}</TableCell>
                        <TableCell>{row.start_date}</TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <CardView data={data} gridValue="2" />
        )
      ) : (
        <Empty />
      )}
    </Box>
  );
}

ProjectTableHead.propTypes = {
  order: PropTypes.any,
  orderBy: PropTypes.string,
};
