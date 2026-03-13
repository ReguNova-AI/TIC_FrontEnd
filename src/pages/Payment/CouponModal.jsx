import { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

import CloseOutlined from "@ant-design/icons/CloseOutlined";
import { useNavigate } from "react-router-dom";

import { PaymentApiService } from "services/api/Payment";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const CouponModal = ({
  open,
  handleClose,
  plan,
  setSnackData,
  disableClose = false,
}) => {
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!coupon.trim()) {
      setError("Please enter a valid coupon code.");
      return;
    }

    if (coupon.trim()?.toLowerCase() !== "intersolar2026") {
      setError("Invalid coupon code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userDetailsRaw = sessionStorage.getItem("userDetails");
      if (userDetailsRaw) {
        const userDetails = JSON.parse(userDetailsRaw);

        const payload = {
          user_id: userDetails[0].user_id,
        };

        PaymentApiService.markPaymentDone(payload)
          .then(() => {
            const existingUserDetailsData = JSON.parse(
              sessionStorage.getItem("userDetails"),
            );

            const currentUser = existingUserDetailsData.find(
              (user) => user.user_id === payload.user_id,
            );

            if (currentUser) {
              currentUser.is_allowed = true;
            }

            sessionStorage.setItem(
              "userDetails",
              JSON.stringify(existingUserDetailsData),
            );

            // Set snackbar data
            setSnackData({
              show: true,
              message: "Payment done successfully.",
              type: "success",
            });

            setTimeout(() => {
              handleClose();
              navigate("/dashboard");
            }, 500);
          })
          .catch((err) => {
            console.error("Payment API failed", err);
            setSnackData({
              show: true,
              message: "Payment failed. Please try again.",
              type: "error",
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={disableClose ? null : handleClose}
      aria-labelledby="coupon-modal-title"
      aria-describedby="coupon-modal-description"
      disableEscapeKeyDown={disableClose}
    >
      <Box sx={style}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography id="coupon-modal-title" variant="h4" component="h2">
            Complete Payment
          </Typography>
          {!disableClose && (
            <IconButton onClick={handleClose} size="small">
              <CloseOutlined />
            </IconButton>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {plan && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Selected Plan: {plan.title}
            </Typography>
            <Typography variant="h3" color="primary" sx={{ mt: 1 }}>
              ${plan.price}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" sx={{ mb: 2 }}>
          Enter your coupon code to activate your plan.
        </Typography>

        <TextField
          fullWidth
          label="Coupon Code"
          variant="outlined"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="ENTER-COUPON"
          sx={{ mb: 2 }}
          error={!!error}
          helperText={error}
        />

        <Stack spacing={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
          >
            {loading ? "Processing..." : "Submit & Get Started"}
          </Button>
          {!disableClose && (
            <Button
              fullWidth
              variant="text"
              color="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};

export default CouponModal;
