import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Space, Table, Avatar, Input, Select,Popover } from 'antd';
import { BUTTON_LABEL, LISTING_PAGE ,FORM_LABEL } from 'shared/constants';
import { formatDate, getStatusChipProps } from "shared/utility";
import Stack from "@mui/material/Stack";
import { UserOutlined } from '@ant-design/icons';
import { Chip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import {SearchOutlined} from "@ant-design/icons";
import projectIcon from "../../assets/images/icons/projectIcon3.svg"
import userListingIcon from "../../assets/images/icons/userListingicon2.svg";
import MultiSelectWithChip from 'components/form/MultiSelectWithChip';

const NestedListing = ({ data,filterStatusValue }) => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState(''); // State for search input
  const [selectedProjectStatuses, setSelectedProjectStatuses] = useState([]); // State for selected project statuses
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [statusData, setStatusData] = useState([
    "Draft",
    "In Progress",
    "Processing",
    "Success",
    "Failed",
  ]);

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = () => {
      const users = data?.map((user) => ({
        key: user?.user_id,
        name: `${user?.user_first_name} ${user?.user_last_name}`,
        profile: user?.user_profile,
        role_name: user?.role_name,
        industry: user?.industry_name,
        project_count: user?.projects?.length,
        projects: user?.projects || [],
      }));

      setDataSource(users);
    };

    fetchData();
  }, [data]);

  useEffect(()=>{
    console.log(filterStatusValue)
    if(filterStatusValue && filterStatusValue !== "Total Projects")
    {
      setSelectedProjectStatuses(filterStatusValue);
    }
  },[filterStatusValue]);

  const handleNavigateToProject = (projectNo) => {
    navigate(`/projectView/${projectNo}`, { state: { projectNo } });
  };

  const expandColumns = [
    {
      title: LISTING_PAGE.PROJECT_NAME,
      dataIndex: 'project_name',
      key: 'project_name',
      render: (text, record) => {return(
        <>
        <img src={projectIcon} width="30px" style={{verticalAlign:"middle",marginRight:"10px"}}/>
        <a
          onClick={() => handleNavigateToProject(record.project_id)}
          style={{ color: "#2ba9bc", cursor: "pointer" }}
        >
          {record.project_name}
        </a>
        </>
      )},
    },
    {
      title: LISTING_PAGE.PROJECT_No,
      dataIndex: 'project_no',
      key: 'project_no',
    },
    {
      title: LISTING_PAGE.NO_OF_RUNS,
      dataIndex: 'no_of_runs',
      key: 'no_of_runs',
    },
    {
      title: LISTING_PAGE.REGULATORY_SANTARDS,
      dataIndex: 'regulatory_standard',
      key: 'regulatory_standard',
    },
    {
      title: LISTING_PAGE.START_DATE,
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => created_at ? formatDate(created_at) : "",
    },
    {
      title: LISTING_PAGE.LAST_RUN,
      dataIndex: 'last_run',
      key: 'last_run',
      render: (last_run) => last_run !== "null" &&
      last_run !== null &&
      last_run !== ""
      ? formatDate(last_run) : "",
    },
    {
      title: LISTING_PAGE.STATUS,
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => {
        const statusArray = Array.isArray(status) ? status : [status];
        return (
          <>
            {statusArray.map((tag, index) => {
              const { title, color, borderColor } = getStatusChipProps(tag);
              return (
                <Stack direction="row" spacing={1} alignItems="center" key={index}>
                  <Chip
                    label={title}
                    color={borderColor}
                    variant="outlined"
                    sx={{
                      bgcolor: color,
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              );
            })}
          </>
        );
      },
      onFilter: (value, record) => {
        const statusArray = Array.isArray(record.status)
          ? record.status
          : [record.status];
        return statusArray.includes(value);
      },
    },
  ];

  const columns = [
    {
      title: "User",
      key: "profile",
      render: (value, record) => {
        let avatarSrc = value.profile || "";
        return (
          <>
          {avatarSrc && avatarSrc !== "null" ? (
            <Avatar
              key={value.user_id}
              sx={{ width: 40, height: 40 }}
              alt={value.user_first_name}
            >

              <img src={avatarSrc} alt={value.user_first_name} style={{ borderRadius: '50%' }} />
            </Avatar>
          ) : (
            <img
              src={userListingIcon}
              width="32px"
              style={{ verticalAlign: "middle" }}
            />
          )}

            <span style={{ marginLeft: "20px" }}>{value.name}</span>
          </>
        );
      },
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
    },
    {
      title: 'Project Created',
      dataIndex: 'project_count',
      key: 'project_count',
    },
  ];

  const expandedRowRender = (record) => {
    // Filter projects based on project status
    const userProjects = record.projects.filter((project) => {
      // Filter by project status if any status is selected
      const matchesStatus =
        selectedProjectStatuses.length === 0 ||
        selectedProjectStatuses.includes(project.status);

      // Filter by project name or user name search text
      const matchesSearchText =
        project.project_name.toLowerCase().includes(searchText.toLowerCase()) ||
        record.name.toLowerCase().includes(searchText.toLowerCase());

      return matchesStatus && matchesSearchText;
    });

    return (
      <>
        <Table columns={expandColumns} dataSource={userProjects} pagination={false} />
      </>
    );
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filterPopoverContent = (
    <div style={{marginBottom:"20px"}}>

<MultiSelectWithChip
        label="Status"
        value={selectedProjectStatuses}
        options={statusData}
        onChange={setSelectedProjectStatuses}
      />
    </div>
  );


  const filterData = (data) => {
    return data.filter((user) => {
      const userMatches = user.name.toLowerCase().includes(searchText.toLowerCase());
      const filteredProjects = user.projects.filter((project) =>
        project.project_name.toLowerCase().includes(searchText.toLowerCase())
      );
      return userMatches || filteredProjects.length > 0;
    });
  };

  return (
    <>
      {/* Search input */}
      <Space style={{float:"right", marginTop:"-20px", marginBottom:"20px"}}>
        <FormControl >
          <InputLabel htmlFor="outlined-adornment-search">
            Search by project name or user name
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-search"
            startAdornment={
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            }
            label={FORM_LABEL.SEARCH}
            onChange={handleSearchChange}
            style={{width:"300px"}}
          />
        </FormControl>
       
              <Popover
                content={filterPopoverContent}
                title={BUTTON_LABEL.FILTER}
                visible={popoverVisible}
                onVisibleChange={setPopoverVisible}
                trigger="click"
              >
                <Button
                  type="primary"
                  style={{ background: "#003a8c", color: "#ffffff" }}
                >
                  {BUTTON_LABEL.FILTER}
                </Button>
                </Popover>
      </Space>
     
      {/* Table rendering */}
      <Table
        columns={columns}
        expandable={{
          expandedRowRender,
          defaultExpandedRowKeys: ['0'],
        }}
        dataSource={filterData(dataSource)}
        rowKey="key"
      />
    </>
  );
};

export default NestedListing;
