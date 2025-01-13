import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Space, Table, Avatar, Input } from 'antd';
import { BUTTON_LABEL, LISTING_PAGE } from 'shared/constants';
import { formatDate, getStatusChipProps } from "shared/utility";
import Stack from "@mui/material/Stack";
import { UserOutlined } from '@ant-design/icons';
import { Chip } from "@mui/material";

// Example API response (replace with actual API call)

const NestedListing = ({ data }) => {
  const [dataSource, setDataSource] = useState([]);
  const [expandDataSource, setExpandDataSource] = useState([]);
  const [searchText, setSearchText] = useState(''); // State for search input

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

  const expandColumns = [
    {
      title: LISTING_PAGE.PROJECT_NAME,
      dataIndex: 'project_name',
      key: 'project_name',
    },
    {
      title: LISTING_PAGE.PROJECT_No,
      dataIndex: 'project_no',
      key: 'project_no',
    },
    {
      title: LISTING_PAGE.NO_OF_RUNS,
      dataIndex: 'runs',
      key: 'runs',
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
      render: (last_run) => last_run ? formatDate(last_run) : "",
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
            <Avatar
              key={value.user_id}
              sx={{ width: 40, height: 40 }}
              alt={value.user_first_name}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt={value.user_first_name} style={{ borderRadius: '50%' }} />
              ) : (
                <UserOutlined style={{color:"black"}}/> // Fallback to icon if no image
              )}
            </Avatar>
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
    const userProjects = record.projects.filter((project) =>
      project.project_name.toLowerCase().includes(searchText.toLowerCase()) ||
      record.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return <Table columns={expandColumns} dataSource={userProjects} pagination={false} />;
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Filter function for both user and project data
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
      <Input
        placeholder="Search by project name or user name"
        value={searchText}
        onChange={handleSearchChange}
        style={{ marginBottom: 16, width: 300 }}
      />

      {/* Table rendering */}
      <Table
        columns={columns}
        expandable={{
          expandedRowRender,
          defaultExpandedRowKeys: ['0'],
        }}
        dataSource={filterData(dataSource)} // Apply the filter
        rowKey="key"
      />
    </>
  );
};

export default NestedListing;
