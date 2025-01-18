import React, { useEffect, useState } from 'react';
import { Table, Avatar, Input,Space } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import { Chip } from "@mui/material";
import Stack from "@mui/material/Stack";
import { formatDate, getStatusChipProps } from "shared/utility";
import { BUTTON_LABEL, LISTING_PAGE ,FORM_LABEL } from 'shared/constants';
import { useLocation, useNavigate } from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import {SearchOutlined} from "@ant-design/icons";
import Orgicon from "../../assets/images/icons/orgListing.svg"
import projectIcon from "../../assets/images/icons/projectIcon3.svg"


// AdminOrgNestedListing Component
const AdminOrgNestedListing = ({data}) => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
        setDataSource(data)
    };
    fetchData();
  }, [data]);

  const handleNavigateToProject = (projectNo) => {
    navigate(`/projectView/${projectNo}`, { state: { projectNo } });
  };


  const projectColumns = [
    {
      title: 'Project Name',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (text, record) => {return(
        <>
        <img src={projectIcon} width="20px" style={{verticalAlign:"middle",marginRight:"10px"}}/>
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
      render: (created_at) => created_at ? formatDate(created_at) : "",
    },
    {
      title: 'Last Run',
      dataIndex: 'last_run',
      key: 'last_run',
      render: (last_run) => last_run ? formatDate(last_run) : "",
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

  // Expandable columns for Industry details
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

  // Columns for Organization listing
  const columns = [
    {
      title: 'Organization',
      dataIndex: 'org_name',
      key: 'org_name',
      render: (value, record) => (
        <>
        {record.org_logo ?
          <Avatar
            sx={{ width: 40, height: 40 }}
            alt={record.org_name}
            src={record.org_logo}
          />
          :
          <img src={Orgicon} width="32px" style={{verticalAlign:"middle"}}/>
        }
          <span style={{ marginLeft: 10 }}>{value}</span>
        </>
      ),
    },
    {
      title: 'Sector',
      dataIndex: 'sector_name',
      key: 'sector_name',
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
          // Calculate the total number of projects for the organization
          const totalProjects = record.industries.reduce((acc, industry) => {
            return acc + (industry.projects ? industry.projects.length : 0);
          }, 0);
          return <span>{totalProjects}</span>;
        },
    }
  ];

  // Filter function based on search text
  const filterData = (data) => {
    
    return data.filter((org) => {
      const orgMatches = org.org_name.toLowerCase().includes(searchText.toLowerCase());
      const industryMatches = org.industries.some(industry =>
        industry.industry_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (industry.projects && industry.projects.some(project =>
          project.project_name.toLowerCase().includes(searchText.toLowerCase())
        ))
      );
      return orgMatches || industryMatches;
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Expanded row render for organization level, showing industries
  const expandedRowRenderForOrg = (record) => {
    return (
      <Table
        columns={industryColumns}
        dataSource={record.industries}
        rowKey="industry_id"
        expandable={{
          expandedRowRender: (industry) => (
            <Table
              columns={projectColumns}
              dataSource={industry.projects || []}
              pagination={false}
              rowKey="project_id"
            />
          ),
        }}
        pagination={false}
      />
    );
  };

  return (
    <>
      {/* Search input */}

      <Space style={{float:"right", marginBottom:"20px"}}>
      <FormControl >
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
                  style={{width:"400px"}}
                />
              </FormControl>
              </Space>


      {/* Table rendering */}
      {console.log("dataSource",dataSource)}
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
