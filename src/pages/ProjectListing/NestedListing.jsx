import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Space, Table } from 'antd';
import { BUTTON_LABEL, LISTING_PAGE } from 'shared/constants';
import { formatDate, getStatusChipProps } from "shared/utility";
import Stack from "@mui/material/Stack";

import { Chip } from "@mui/material";

// Example API response (replace with actual API call)

const NestedListing = ({data}) => {
  const [dataSource, setDataSource] = useState([]);
  const [expandDataSource, setExpandDataSource] = useState([]);

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = () => {
      const users = data?.map((user) => ({
        key: user.user_id,
        name: `${user.user_first_name} ${user.user_last_name}`,
        profile: user.user_profile,
        role_id: user.role_id,
      }));

      const projects = data?.flatMap((user) => {
        return user.projects.map((project) => ({
          key: project.project_id,
          last_run: project.last_run !== "null" && project.last_run !== null  && project.last_run !== "" ? formatDate(project.last_run) : "", // last_run
          project_name: project.project_name,
          project_no:project.project_no,
          industry:project.industry,
          regulatory_standard:project.regulatory_standard,
          start_date:project.created_at !== "null" && project.created_at !== null && project.created_at !== ""  ? formatDate(project.created_at) : "", // start_date
          status:project.status,
          runs:project.runs,  
        }));
      });

      setDataSource(users);
      setExpandDataSource(projects);
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
        dataIndex: 'start_date',
        key: 'start_date',
      },
      {
        title: LISTING_PAGE.LAST_RUN,
        dataIndex: 'last_run',
        key: 'last_run',
      },
    {
      title: LISTING_PAGE.STATUS,
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => {
        // Check if status is an array, and handle accordingly
        const statusArray = Array.isArray(status) ? status : [status];

        // Return the mapped JSX elements
        return (
          <>
            {statusArray.map((tag, index) => {
              const { title, color, borderColor } = getStatusChipProps(tag);

              return (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  key={index}
                >
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
      // filters: [
      //   { text: "In Progress", value: "In Progress" },
      //   { text: "Active", value: "Active" },
      //   { text: "Success", value: "Success" },
      //   { text: "Failed", value: "Failed" },
      // ],
      onFilter: (value, record) => {
        // Modify the filter logic if status is an array or single value
        const statusArray = Array.isArray(record.status)
          ? record.status
          : [record.status];
        return statusArray.includes(value);
      },
    },
    // {
    //     title: LISTING_PAGE.ACTION,
    //     key: "action",
    //     dataIndex: "status",
    //     render: (_,  { status }) => (
    //       <Button
    //         variant="contained"
    //         style={{ background: status === "In Progress" ? "#dcdfdf" :"#003a8c", color:status === "In Progress" ? "#959191" : "#ffffff" }}
    //         disabled={status === "In Progress" ? true : false}
    //       >
    //         {BUTTON_LABEL.RUN_PROJECT}
    //       </Button>
    //     ),
    //   },
  ];

  const columns = [
    {
      title: 'User Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Profile',
      dataIndex: 'profile',
      key: 'profile',
    },
    {
      title: 'Role',
      dataIndex: 'role_id',
      key: 'role_id',
    },
  ];

  const expandedRowRender = (record) => {
    const userProjects = data
      .find((user) => user.user_id === record.key)
      ?.projects.map((project) => ({
        key: project.project_id,
          last_run: project.last_run !== "null" && project.last_run !== null  && project.last_run !== "" ? formatDate(project.last_run) : "", // last_run
          project_name: project.project_name,
          project_no:project.project_no,
          industry:project.industry,
          regulatory_standard:project.regulatory_standard,
          start_date:project.created_at !== "null" && project.created_at !== null && project.created_at !== ""  ? formatDate(project.created_at) : "", // start_date
          status:project.status,
          runs:project.runs,  
      }));

    return <Table columns={expandColumns} dataSource={userProjects} pagination={false} />;
  };

  return (
    <>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender,
          defaultExpandedRowKeys: ['0'],
        }}
        dataSource={dataSource}
      />
    </>
  );
};

export default NestedListing;
