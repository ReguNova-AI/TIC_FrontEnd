import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Container,
  Divider,
} from "@mui/material";
import { CheckOutlined } from "@ant-design/icons";

// project import
import MainCard from "components/MainCard";

// pricing data
const pricingData = [
  {
    id: "starter",
    title: "Starter Project",
    price: "499",
    period: "",
    description: "Ideal for small teams starting with contract conformity.",
    features: ["Up to 5 Contracts/Documents"],
    isPopular: false,
    buttonText: "Get Started",
    buttonVariant: "outlined",
    buttonLink: "https://buy.stripe.com/bJe4gydEJg1c63v5Nqc7u08",
  },
  {
    id: "standard",
    title: "Standard Project",
    price: "1,299",
    period: "",
    description: "Perfect for growing teams needing more flexibility.",
    features: ["Up to 15 Contracts/Documents"],
    isPopular: false,
    buttonText: "Choose Standard",
    buttonVariant: "outlined",
    buttonLink: "https://buy.stripe.com/5kQ28qgQVbKWeA15Nqc7u09",
  },
  {
    id: "additionalcontract",
    title: "Additional Contract",
    price: "99",
    period: "",
    description: "Ideal for exploring additional contract conformity.",
    features: ["1 Contract/Documents"],
    isPopular: true,
    buttonText: "Get Started",
    buttonVariant: "contained",
    buttonLink: "https://buy.stripe.com/14A3cufMRaGSbnPa3Gc7u04",
  },
  {
    id: "advanced",
    title: "Advanced Project",
    price: "1,999",
    period: "",
    description: "Comprehensive solution for large-scale operations.",
    features: ["Up to 25 Contracts/Documents"],
    isPopular: false,
    buttonText: "Choose Advanced",
    buttonVariant: "outlined",
    buttonLink: "https://buy.stripe.com/aFadR81W1cP0fE52Bec7u07",
  },
  {
    id: "complex",
    title: "Complex Project",
    price: "3,499",
    period: "",
    description: "Enterprise-grade features for high-volume needs.",
    features: ["Up to 50 Contracts/Documents"],
    isPopular: false,
    buttonText: "Choose Complex",
    buttonVariant: "outlined",
    buttonLink: "https://buy.stripe.com/aFaaEW6ch7uGgI94Jmc7u06",
  },
  {
    id: "enterprise",
    title: "Enterprise Project",
    price: "4,999",
    period: "",
    description: "Maximum scale for enterprise grid operations.",
    features: ["Up to 75 Contracts/Documents"],
    isPopular: false,
    buttonText: "Choose Enterprise",
    buttonVariant: "outlined",
    buttonLink: "https://buy.stripe.com/8x25kC7gl8yK77zejWc7u05",
  },
];

function Payment() {
  const theme = useTheme();

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Stack spacing={2} my={6} width={"100%"} alignItems={"center"}>
          <Typography variant="h1" sx={{ fontWeight: 700 }} textAlign="center">
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="h5"
            color="textSecondary"
            sx={{ maxWidth: 600, mx: "auto" }}
            textAlign="center"
          >
            Choose the plan that fits your organization's needs. Scale
            high-conformity operations with confidence.
          </Typography>
        </Stack>

        <Grid container spacing={3} alignItems="stretch">
          {pricingData.map((plan) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={plan.id}>
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
                  ...(plan.isPopular && {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                    boxShadow: theme.customShadows.z1,
                  }),
                }}
              >
                {plan.isPopular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      fontWeight: 600,
                      borderRadius: "4px",
                    }}
                  />
                )}

                <Box sx={{ p: 1 }}>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {plan.title}
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
                      {plan.price === "Custom" ? "" : "$"}
                      {plan.price}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="textSecondary"
                      component="span"
                    >
                      {plan.period}
                    </Typography>
                  </Stack>

                  <Button
                    fullWidth
                    variant={plan.buttonVariant}
                    color="primary"
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 1.5,
                      fontWeight: 600,
                      mb: 4,
                    }}
                    href={plan.buttonLink}
                    component="a"
                    target="_blank"
                  >
                    {plan.buttonText}
                  </Button>

                  <Divider sx={{ mb: 3 }} />

                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    What's included:
                  </Typography>

                  <List sx={{ p: 0 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem
                        key={index}
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
                          primary={feature}
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
    </Box>
  );
}

export default Payment;
