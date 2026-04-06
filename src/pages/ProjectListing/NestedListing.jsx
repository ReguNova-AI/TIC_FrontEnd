import React, { useEffect, useState } from "react";
import { Space, Table, Avatar } from "antd";
import { LISTING_PAGE } from "shared/constants";
import { formatDate } from "shared/utility";
import { useNavigate } from "react-router-dom";
import projectIcon from "../../assets/images/icons/projectIcon3.svg";
import userListingIcon from "../../assets/images/icons/userListingicon2.svg";
import SearchInput from "components/form/SearchInput";

const NestedListing = ({ data, filterStatusValue }) => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState(""); // State for search input
  const [selectedProjectStatuses, setSelectedProjectStatuses] = useState([]); // State for selected project statuses
  const [sortConfigs, setSortConfigs] = useState({});

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = () => {
      const users = data?.map((user) => ({
        key: user?.user_id,
        name: `${user?.user_first_name} ${user?.user_last_name}`,
        profile: user?.user_profile,
        role_name: user?.role_name,
        industry: user?.industry_names,
        project_count: user?.projects?.length,
        projects: (user?.projects || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      }));

      setDataSource(users);
    };

    fetchData();
  }, [data]);

  useEffect(() => {
    if (filterStatusValue && filterStatusValue !== "Total Projects") {
      setSelectedProjectStatuses(filterStatusValue);
    }
  }, [filterStatusValue]);

  const handleNavigateToProject = (projectNo) => {
    navigate(`/projectView/${projectNo}`, { state: { projectNo } });
  };

  const expandColumns = [
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.PROJECT_NAME}</span>,
      dataIndex: "project_name",
      key: "project_name",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
      render: (text, record) => {
        return (
          <>
            <img
              src={projectIcon}
              width="30px"
              style={{ verticalAlign: "middle", marginRight: "10px" }}
            />
            <a
              onClick={() => handleNavigateToProject(record.project_id)}
              style={{ color: "#5B0429", cursor: "pointer" }}
            >
              {record.project_name}
            </a>
          </>
        );
      },
    },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.PROJECT_No}</span>,
      dataIndex: "project_id",
      key: "project_id",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.NO_OF_RUNS}</span>,
      dataIndex: "no_of_runs",
      key: "no_of_runs",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
    },
    // {
    //   title: LISTING_PAGE.REGULATORY_SANTARDS,
    //   dataIndex: "regulatory_standard",
    //   key: "regulatory_standard",
    // },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.INDUSTRY}</span>,
      dataIndex: "industry_name",
      key: "industry_name",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.START_DATE}</span>,
      dataIndex: "created_at",
      key: "created_at",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
      render: (created_at) => (created_at ? formatDate(created_at) : ""),
    },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.LAST_RUN}</span>,
      dataIndex: "last_run",
      key: "last_run",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
      render: (last_run) =>
        last_run !== "null" && last_run !== null && last_run !== ""
          ? formatDate(last_run)
          : "--",
    },
    // {
    //   title: LISTING_PAGE.STATUS,
    //   key: "status",
    //   dataIndex: "status",
    //   render: (_, { status }) => {
    //     const statusArray = Array.isArray(status) ? status : [status];
    //     return (
    //       <>
    //         {statusArray.map((tag, index) => {
    //           const { title, color, borderColor } = getStatusChipProps(tag);
    //           return (
    //             <Stack
    //               direction="row"
    //               spacing={1}
    //               alignItems="center"
    //               key={index}
    //             >
    //               <Chip
    //                 label={title}
    //                 color={borderColor}
    //                 variant="outlined"
    //                 sx={{
    //                   bgcolor: color,
    //                   borderRadius: "20px",
    //                   fontSize: "12px",
    //                   fontWeight: 600,
    //                 }}
    //               />
    //             </Stack>
    //           );
    //         })}
    //       </>
    //     );
    //   },
    //   onFilter: (value, record) => {
    //     const statusArray = Array.isArray(record.status)
    //       ? record.status
    //       : [record.status];
    //     return statusArray.includes(value);
    //   },
    // },
  ];

  const columns = [
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>User</span>,
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
                <img
                  src={avatarSrc}
                  alt={value.user_first_name}
                  style={{ borderRadius: "50%" }}
                />
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
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>Industry</span>,
      // dataIndex: 'industry',
      key: "industry",
      render: (record) => {
        // console.log("industry", record);
        return (
          record &&
          record?.industry?.map((data, index) => {
            return index === 0 ? data : ", " + data;
          })
        );
      },
    },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>Role</span>,
      dataIndex: "role_name",
      key: "role_name",
    },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>Project Created</span>,
      dataIndex: "project_count",
      key: "project_count",
    },
  ];

  const handleExpandedTableChange = (recordKey) => (pagination, _, sorter) => {
    if (sorter?.columnKey && sorter?.order) {
      setSortConfigs((prev) => ({
        ...prev,
        [recordKey]: { sortBy: sorter.columnKey, sortOrder: sorter.order },
      }));
    } else {
      setSortConfigs((prev) => ({
        ...prev,
        [recordKey]: { sortBy: null, sortOrder: null },
      }));
    }
  };

  const expandedRowRender = (record) => {
    const { sortBy, sortOrder } = sortConfigs[record.key] || {};
    let userProjects = record.projects.filter((project) => {
      const matchesStatus =
        selectedProjectStatuses.length === 0 ||
        selectedProjectStatuses.includes(project.status);

      const matchesSearchText =
        project.project_name.toLowerCase().includes(searchText.toLowerCase()) ||
        record.name.toLowerCase().includes(searchText.toLowerCase());

      return matchesStatus && matchesSearchText;
    });

    // Client-side sort scoped to this row
    if (sortBy) {
      userProjects = [...userProjects].sort((a, b) => {
        const aVal = a[sortBy] ?? "";
        const bVal = b[sortBy] ?? "";

        if (sortBy === "created_at" || sortBy === "last_run") {
          const parseDate = (val) => {
            if (!val || val === "null") return 0;
            const normalized = val.toString().replace(" ", "T").split(".")[0];
            const d = new Date(normalized);
            return isNaN(d.getTime()) ? 0 : d.getTime();
          };
          return sortOrder === "ascend"
            ? parseDate(aVal) - parseDate(bVal)
            : parseDate(bVal) - parseDate(aVal);
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "ascend" ? aVal - bVal : bVal - aVal;
        }

        return sortOrder === "ascend"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return (
      <Table
        onChange={handleExpandedTableChange(record.key)} // curry the key
        columns={expandColumns}
        dataSource={userProjects}
        pagination={false}
      />
    );
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filterData = (data) => {
    return data?.filter((user) => {
      const userMatches = user.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const filteredProjects = user.projects.filter((project) =>
        project.project_name.toLowerCase().includes(searchText.toLowerCase()),
      );
      return userMatches || filteredProjects.length > 0;
    });
  };

  return (
    <>
      {/* Search input */}
      <Space
        style={{ float: "right", marginTop: "-20px", marginBottom: "20px" }}
      >
        <SearchInput
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search by project name or user name"
          width={300}
        />
      </Space>

      {/* Table rendering */}
      <Table
        columns={columns}
        expandable={{
          expandedRowRender,
          defaultExpandedRowKeys: ["0"],
        }}
        dataSource={filterData(dataSource)}
        rowKey="key"
      />
    </>
  );
};

export default NestedListing;
