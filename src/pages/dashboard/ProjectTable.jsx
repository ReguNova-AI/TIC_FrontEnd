import PropTypes from 'prop-types';
// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Empty } from 'antd';

// third-party
import { NumericFormat } from 'react-number-format';

// project import
import Dot from 'components/@extended/Dot';
import { Chip } from '@mui/material';
import { useEffect, useState } from 'react';
import { ProjectApiService } from 'services/api/ProjectAPIService';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { API_ERROR_MESSAGE } from 'shared/constants';
import { formatDate, getStatusChipProps } from 'shared/utility';
import CardView from 'pages/ProjectListing/CardView';
import ToggleButtons from 'pages/ProjectListing/ToggleButton';



function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}


// ==============================|| PROJECT TABLE - HEADER ||============================== //

function ProjectTableHead({ order, orderBy }) {

  const headCells = [
    {
      id: 'project_name',
      align: 'left',
      disablePadding: false,
      label: 'Project name'
    },
    {
      id: 'project_no',
      align: 'left',
      disablePadding: true,
      label: 'Project no.'
    },
    {
      id: 'runs',
      align: 'left',
      disablePadding: false,
      label: 'No. of runs'
    },
    {
      id: 'last_run',
      align: 'left',
      disablePadding: false,
      label: 'Last Run'
    },
    {
      id: 'status',
      align: 'left',
      disablePadding: false,
      label: 'Status'
    }
  ];

  

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function ProjectStatus({ status }) {
  const { title, color, borderColor } = getStatusChipProps(status);
  
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {/* <Dot color={color} /> */}
      {/* <Typography>{title}</Typography> */}
      <Chip label={title} color={borderColor} variant="outlined" sx={{bgcolor:color, borderRadius:'20px', fontSize:"12px", fontWeight:600}}/>
    </Stack>
  );
}

// ==============================|| PROJECT TABLE ||============================== //

export default function ProjectTable() {
  const order = 'asc';
  const orderBy = 'index';

  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState("card");
  
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
    runs,
    industry,
    mapping_no,
    regulatory_standard,
    start_date,
    last_run,
    status
  ) => {
    return {
      index,
      project_no,
      project_name,
      runs,
      industry,
      mapping_no,
      regulatory_standard,
      start_date,
      last_run,
      status,
    };
  };

  const fetchData = () => {
    ProjectApiService.projectListing()
      .then((response) => {
        
        // console.log("response",response)

        const newData = response?.data?.details.map((project, index) => {
          return createData(
            project.project_id, // index
            project.project_no, // project_no
            project.project_name, // project_name
            project.no_of_runs, // runs
            project.industry_name, // industry
            project.mapping_standards, // mapping_no
            project.regulatory_standard,
            project.created_at !== "null" && project.created_at !== "" ? formatDate(project.created_at) : "", // start_date
            project.last_run !== "null" && project.last_run !== "" ? formatDate(project.last_run) : "", // last_run
            project.status // status
          );
        });

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
    setViewMode(newViewMode); // Update view mode (list or card)
  };

  return (
    <Box style={{padding:"10px 20px", minHeight:"428px",alignContent: data.length > 0 ? "normal" :"space-around"}}>
      {data.length > 0 &&
      <Box style={{float:"right"}}>
      <ToggleButtons onViewModeChange={handleViewModeChange} viewSelected="card" />
      </Box>
      }
      {data.length > 0 ?
      viewMode === "list"? 
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' }
        }}
      >
        <Table aria-labelledby="tableTitle">
          <ProjectTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {stableSort(data, getComparator(order, orderBy)).map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  tabIndex={-1}
                  key={row.project_name}
                >
                  <TableCell component="th" id={labelId} scope="row">
                    <Link color="secondary"> {row.project_name}</Link>
                  </TableCell>
                  <TableCell>{row.project_no}</TableCell>
                  <TableCell>{row.runs}</TableCell>
                  <TableCell>{row.last_run}</TableCell>
                  <TableCell align="right">
                    <ProjectStatus status={row.status} />
                    {/* <NumericFormat value={row.status} displayType="text" thousandSeparator prefix="$" /> */}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      :
      <CardView data={data} gridValue="2"/>
      : <Empty />}
    </Box>
  );
}

ProjectTableHead.propTypes = { order: PropTypes.any, orderBy: PropTypes.string };

ProjectStatus.propTypes = { status: PropTypes.number };
