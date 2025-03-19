import React, { useEffect, useState } from 'react';
import { Table, Avatar, Input, Space, Popover, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Chip } from "@mui/material";
import Stack from "@mui/material/Stack";
import { formatDate, getStatusChipProps } from "shared/utility";
import { BUTTON_LABEL, LISTING_PAGE, FORM_LABEL } from 'shared/constants';
import { useNavigate } from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Orgicon from "../../assets/images/icons/orgListing.svg";
import projectIcon from "../../assets/images/icons/projectIcon3.svg";
import MultiSelectWithChip from 'components/form/MultiSelectWithChip';

// AdminOrgNestedListing Component
const AdminOrgNestedListing = ({ data,  }) => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [projectStatuses, setprojectStatuses] = useState([
    "Draft",
    "In Progress",
    "Processing",
    "Success",
    "Failed",
  ]);
  // Fetch data when the component mounts
  useEffect(() => {
    setDataSource(data);
  }, [data]);

  // Function to navigate to project view
  const handleNavigateToProject = (projectNo) => {
    navigate(`/projectView/${projectNo}`, { state: { projectNo } });
  };

  // Update filtered data whenever searchText or selectedStatuses changes
  useEffect(() => {
    const filteredData = filterData(data);
    setDataSource(filteredData);
  }, [searchText, selectedStatuses, data]);

  // Columns for Project table
  const projectColumns = [
    {
      title: 'Project Name',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (text, record) => {
        return (
          <>
            <img src={projectIcon} width="30px" style={{ verticalAlign: "middle", marginRight: "10px" }} />
            <a
              onClick={() => handleNavigateToProject(record.project_id)}
              style={{ color: "#2ba9bc", cursor: "pointer" }}
            >
              {record.project_name}
            </a>
          </>
        );
      },
    },
    {
      title: 'Project No',
      dataIndex: 'project_no',
      key: 'project_no',
    },
    {
      title: 'No. of Runs',
      dataIndex: 'no_of_runs',
      key: 'no_of_runs',
    },
    {
      title: 'Regulatory Standards',
      dataIndex: 'regulatory_standard',
      key: 'regulatory_standard',
    },
    {
      title: 'Start Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => created_at && created_at !== "null" ? formatDate(created_at) : "",
    },
    {
      title: 'Last Run',
      dataIndex: 'last_run',
      key: 'last_run',
      render: (last_run) => last_run && last_run !== "null" ? formatDate(last_run) : "",
    },
    {
      title: 'Status',
      key: 'status',
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
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              );
            })}
          </>
        );
      },
    },
  ];

  // Columns for Industry table
  const industryColumns = [
    {
      title: 'Industry Name',
      dataIndex: 'industry_name',
      key: 'industry_name',
    },
    {
      title: 'Number of Projects',
      dataIndex: 'projects',
      key: 'projects',
      render: (projects) => projects ? projects.length : 0,
    },
  ];

  // Columns for Organization table
  const columns = [
    {
      title: 'Organization',
      dataIndex: 'org_name',
      key: 'org_name',
      render: (value, record) => (
        <>
          {record.org_logo ? (
            <Avatar sx={{ width: 40, height: 40 }} alt={record.org_name} src={record.org_logo} />
          ) : (
            <img src={Orgicon} width="32px" style={{ verticalAlign: "middle" }} />
          )}
          <span style={{ marginLeft: 10 }}>{value}</span>
        </>
      ),
    },
    {
      title: 'Total Industries',
      dataIndex: 'industries',
      key: 'industries',
      render: (industries) => industries ? industries.length : 0,
    },
    {
      title: 'Total Projects',
      key: 'total_projects',
      render: (_, record) => {
        const totalProjects = record.industries.reduce((acc, industry) => {
          return acc + (industry.projects ? industry.projects.length : 0);
        }, 0);
        return <span>{totalProjects}</span>;
      },
    },
  ];

  // Filter function based on search text and selected statuses
const filterData = (data) => {
  return data
    .filter((org) => {
      // Check if organization or industry names match the search text
      const orgMatches = org.org_name?.toLowerCase().includes(searchText?.toLowerCase());
      const industryMatches = org.industries.some(industry =>
        industry.industry_name?.toLowerCase().includes(searchText?.toLowerCase()) ||
        (industry.projects && industry.projects.some(project =>
          project.project_name?.toLowerCase().includes(searchText?.toLowerCase())
        ))
      );

      // Filter projects by status within industries
      const filteredIndustries = org?.industries?.map(industry => ({
        ...industry,
        projects: industry?.projects?.filter(project => {
          return selectedStatuses?.length === 0 || selectedStatuses?.some(status => project?.status?.includes(status));
        }),
      }));

      // Only include industries with projects matching the selected statuses
      const industriesWithFilteredProjects = filteredIndustries?.filter(industry => industry?.projects?.length > 0);

      return (orgMatches || industryMatches) && industriesWithFilteredProjects.length > 0;
    }).map(org => ({
      ...org,
      industries: org?.industries?.filter(industry => industry.projects?.some(project => {
        return selectedStatuses?.length === 0 || selectedStatuses?.some(status => project?.status?.includes(status));
      }))
    }));
};

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Handle status change
  const handleStatusChange = (value) => {
    setSelectedStatuses(value);
  };


  const filterPopoverContent = (
    <div style={{marginBottom:"20px"}}>

      <MultiSelectWithChip
        label="Status"
        value={selectedStatuses}
        options={projectStatuses}
        onChange={handleStatusChange}
      />

    </div>
  );

  // Expanded row render for organization level, showing industries
const expandedRowRenderForOrg = (record) => {
  return (
    <Table
      columns={industryColumns}
      dataSource={record.industries}
      rowKey="industry_id"
      expandable={{
        expandedRowRender: (industry) => {
          const industryProjects = industry?.projects?.filter((project) => {
            // Filter by project status if any status is selected
            const matchesStatus =
            selectedStatuses?.length === 0 ||
            selectedStatuses?.includes(project.status);
      
            // Filter by project name or user name search text
            const matchesSearchText =
              project?.project_name?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
              record?.name?.toLowerCase()?.includes(searchText?.toLowerCase());
      
            return matchesStatus && matchesSearchText;
          });
          return (<Table
            columns={projectColumns}
            dataSource={industryProjects || []} 
            pagination={false}
            rowKey="project_id"
          />);
        },
      }}
      pagination={false}
    />
  );
};

  return (
    <>
      {/* Search input */}
      <Space style={{ float: "right", marginBottom: "20px" }}>
        <FormControl>
          <InputLabel htmlFor="outlined-adornment-search">
            Search by organization, industry, or project name
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
            style={{ width: "400px" }}
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
        dataSource={dataSource} // Apply the filter
        rowKey="org_id"
        expandable={{
          expandedRowRender: expandedRowRenderForOrg,
        }}
      />
    </>
  );
};

export default AdminOrgNestedListing;
