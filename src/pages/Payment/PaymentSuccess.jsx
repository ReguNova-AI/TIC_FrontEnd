import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import ClockCircleOutlined from "@ant-design/icons/ClockCircleOutlined";

import { PaymentApiService } from "services/api/Payment";
import { UserApiService } from "services/api/UserAPIService";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "pending" | "error" | "no-session"
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("no-session");
      return;
    }

    const userDetailsRaw = sessionStorage.getItem("userDetails");

    PaymentApiService.getCheckoutSession(sessionId)
      .then((response) => {
        const paymentData = response?.data?.payment || null;
        setPayment(paymentData);

        const isPaid = paymentData?.status?.toLowerCase() === "completed";

        if (!isPaid) {
          // Payment not completed yet (e.g. still "pending") — don't activate.
          setStatus("pending");
          return;
        }

        // Refresh is_allowed / available_contract_count from /api/v1/me
        return UserApiService.getMe()
          .then((meResponse) => {
            const freshUser = meResponse?.data?.userDetails?.[0];

            if (userDetailsRaw && freshUser) {
              try {
                const userDetails = JSON.parse(userDetailsRaw);
                userDetails[0] = {
                  ...userDetails[0],
                  is_allowed: freshUser.is_allowed,
                  available_contract_count: freshUser.available_contract_count,
                };
                sessionStorage.setItem(
                  "userDetails",
                  JSON.stringify(userDetails),
                );
                sessionStorage.removeItem("selectedPlan");
              } catch {
                // ignore userDetails parsing issues; payment info still shown
              }
            }
          })
          .then(() => {
            setStatus("success");
          });
      })
      .catch(() => {
        setStatus("error");
      });
  }, [searchParams]);

  if (status === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} />
          <Typography variant="h5" color="textSecondary">
            Confirming your payment...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (status === "no-session") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Stack alignItems="center" spacing={3} sx={{ maxWidth: 480 }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: "#52c41a" }} />
          <Typography variant="h3" fontWeight={700} textAlign="center">
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="textSecondary" textAlign="center">
            Your payment was processed. Please log in to access your dashboard.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </Stack>
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Stack alignItems="center" spacing={3} sx={{ maxWidth: 480 }}>
          <CloseCircleOutlined style={{ fontSize: 64, color: "#ff4d4f" }} />
          <Typography variant="h3" fontWeight={700} textAlign="center">
            Something went wrong
          </Typography>
          <Typography variant="body1" color="textSecondary" textAlign="center">
            Your payment was received but we could not activate your account
            automatically. Please contact support.
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Box>
    );
  }

  if (status === "pending") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Stack alignItems="center" spacing={3} sx={{ maxWidth: 480 }}>
          <ClockCircleOutlined style={{ fontSize: 64, color: "#faad14" }} />
          <Typography variant="h3" fontWeight={700} textAlign="center">
            Payment Pending
          </Typography>
          {payment && (
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                width: "100%",
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {payment.product_name}
              </Typography>
              <Typography variant="h4" color="primary">
                ${payment.amount}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1, textTransform: "capitalize" }}
              >
                Status: {payment.status}
              </Typography>
            </Box>
          )}
          <Typography variant="body1" color="textSecondary" textAlign="center">
            Your payment is still being processed. This can take a little while.
            Your account will be activated once the payment is confirmed.
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Stack alignItems="center" spacing={3} sx={{ maxWidth: 480 }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: "#52c41a" }} />
        <Typography variant="h3" fontWeight={700} textAlign="center">
          Payment Successful!
        </Typography>
        {payment && (
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 2,
              width: "100%",
              textAlign: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {payment.product_name}
            </Typography>
            <Typography variant="h4" color="primary">
              ${payment.amount}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 1, textTransform: "capitalize" }}
            >
              Status: {payment.status}
            </Typography>
          </Box>
        )}
        <Typography variant="body1" color="textSecondary" textAlign="center">
          Your account has been activated. You can now access the dashboard.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </Stack>
    </Box>
  );
}

export default PaymentSuccess;
