import React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// project import
import MainCard from "components/MainCard";
import CouponModal from "./CouponModal";
import { PaymentApiService } from "services/api/Payment";

function Payment({ isFromRestriction: isFromRestrictionProp = false }) {
  const theme = useTheme();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const isFromRestriction =
    isFromRestrictionProp || searchParams.get("source") === "restriction";

  const [pricingData, setPricingData] = useState([]);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    PaymentApiService.getProducts()
      .then((response) => {
        const products = response?.data?.products || [];
        setPricingData(products);
      })
      .catch(() => {
        setSnackData({
          show: true,
          message: "Failed to load pricing plans.",
          type: "error",
        });
      });
  }, []);

  const handleOpenModal = (plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSelectPlan = (plan) => {
    if (!isFromRestriction) {
      handleOpenModal(plan);
      return;
    }

    setCheckoutLoadingId(plan.id);
    sessionStorage.setItem(
      "selectedPlan",
      JSON.stringify({
        name: plan.name,
        amount: plan.amount,
        contract_count: plan.contract_count,
      }),
    );

    PaymentApiService.createCheckout({ price_id: plan.price_id })
      .then((response) => {
        const checkoutUrl = response?.data?.checkout_url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          throw new Error("Missing checkout URL");
        }
      })
      .catch(() => {
        setCheckoutLoadingId(null);
        setSnackData({
          show: true,
          message: "Failed to start checkout. Please try again.",
          type: "error",
        });
      });
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Stack spacing={2} my={6} width={"100%"} alignItems={"center"}>
          <Typography variant="h1" sx={{ fontWeight: 700 }} textAlign="center">
            Finalize Your Subscription
          </Typography>
          <Typography
            variant="h5"
            color="textSecondary"
            sx={{ maxWidth: 600, mx: "auto" }}
            textAlign="center"
          >
            Activate your account to access the dashboard.
          </Typography>
        </Stack>

        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
        >
          {pricingData.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <MainCard
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  transition:
                    "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.customShadows.z1,
                  },
                }}
              >
                <Box sx={{ p: 1 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 3, minHeight: 40 }}
                  >
                    {plan.description}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="baseline"
                    spacing={0.5}
                    sx={{ mb: 3 }}
                  >
                    <Typography
                      variant="h2"
                      component="span"
                      sx={{ fontWeight: 700 }}
                    >
                      ${plan.amount / 100}
                    </Typography>
                  </Stack>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 1.5,
                      fontWeight: 600,
                      mb: 4,
                    }}
                    disabled={checkoutLoadingId === plan.id}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {checkoutLoadingId === plan.id
                      ? "Redirecting..."
                      : "Buy Now"}
                  </Button>

                  <Divider sx={{ mb: 3 }} />

                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    What's included:
                  </Typography>
{/*  */}
                  {/* <List sx={{ p: 0 }}>
                    <ListItem
                      disableGutters
                      sx={{ py: 1, alignItems: "flex-start" }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                        <CheckOutlined
                          style={{
                            color: theme.palette.success.main,
                            fontSize: "1rem",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${plan.contract_count} Contract(s)/Documents`}
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { color: theme.palette.text.primary },
                        }}
                      />
                    </ListItem>
                  </List> */}

                  <List sx={{ p: 0 }}>
                    {plan.metadata &&
                      Object.entries(plan.metadata).map(([key, value]) => (
                        <ListItem
                          key={key}
                          disableGutters
                          sx={{ py: 1, alignItems: "flex-start" }}
                        >
                          <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                            <CheckOutlined
                              style={{
                                color: theme.palette.success.main,
                                fontSize: "1rem",
                              }}
                            />
                          </ListItemIcon>

                          <ListItemText
                            primary={value}
                            primaryTypographyProps={{
                              variant: "body2",
                              sx: { color: theme.palette.text.primary },
                            }}
                          />
                        </ListItem>
                      ))}
                  </List>
                </Box>
              </MainCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Snackbar
        style={{ top: "80px" }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackData.show}
        autoHideDuration={3000}
        onClose={() => setSnackData({ show: false })}
      >
        <Alert
          onClose={() => setSnackData({ show: false })}
          severity={snackData.type}
        >
          {snackData.message}
        </Alert>
      </Snackbar>

      <CouponModal
        open={modalOpen}
        setSnackData={setSnackData}
        handleClose={handleCloseModal}
        plan={selectedPlan}
      />
    </Box>
  );
}

export default Payment;
