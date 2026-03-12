import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { SearchOutlined } from "@ant-design/icons";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  width = 300,
  onSearchClick,
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderRadius: "40px",
        border: "1px solid",
        // borderColor: "divider",
        borderColor: theme.palette.grey.A200,
        backgroundColor: theme.palette.background.paper,
        width,
        transition: "all 0.2s ease",

        "&:hover": {
          borderColor: theme.palette.primary.main,
        },

        "&:focus-within": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
        },
      }}
    >
      <InputBase
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        sx={{
          flex: 1,
          ml: 2,
          fontSize: "14px",
        }}
      />

      <Box
        onClick={onSearchClick}
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: theme.palette.grey.A800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",

          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            "& svg": {
              color: "#fff",
            },
          },
        }}
      >
        <SearchOutlined
          style={{ color: theme.palette.primary.main, fontSize: "16px" }}
        />
      </Box>
    </Box>
  );
}
