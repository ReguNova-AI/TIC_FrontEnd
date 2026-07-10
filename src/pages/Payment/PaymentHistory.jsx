import React, { useEffect, useState } from "react";
import { Space, Table, ConfigProvider, Empty, Spin, Tag } from "antd";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { PaymentApiService } from "services/api/Payment";
import { API_ERROR_MESSAGE, GENERIC_DATA_LABEL } from "shared/constants";

const STATUS_COLORS = {
  completed: "green",
  complete: "green",
  paid: "green",
  success: "green",
  pending: "gold",
  failed: "red",
  canceled: "red",
  cancelled: "red",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    PaymentApiService.getMyPayments()
      .then((response) => {
        setPayments(response?.data?.payments || []);
        setLoading(false);
      })
      .catch((errResponse) => {
        setLoading(false);
        setSnackData({
          show: true,
          message:
            errResponse?.response?.data?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  }, []);

  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "product_name",
      key: "product_name",
      render: (text) => text || "-",
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) =>
        `${(record.currency || "").toUpperCase()} ${record.amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status?.toLowerCase()] || "default"}>
          {(status || "").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (value) => formatDate(value),
    },
  ];

  const paginatedData = payments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <Spin tip="Loading" size="large" spinning={loading}>
      <ConfigProvider
        renderEmpty={() => <Empty description={GENERIC_DATA_LABEL.NO_DATA} />}
      >
        <Space
          direction="vertical"
          style={{
            width: "100%",
            background: "#ffffff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "6px 12px 20px #e4e4e4",
          }}
        >
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize,
              total: payments.length,
              onChange: handlePaginationChange,
            }}
          />
        </Space>

        <Snackbar
          style={{ top: "80px" }}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={snackData.show}
          autoHideDuration={9000}
          onClose={() => setSnackData({ show: false })}
        >
          <Alert
            onClose={() => setSnackData({ show: false })}
            severity={snackData.type}
          >
            {snackData.message}
          </Alert>
        </Snackbar>
      </ConfigProvider>
    </Spin>
  );
};

export default PaymentHistory;
