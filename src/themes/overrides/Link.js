// ==============================|| OVERRIDES - LINK ||============================== //

export default function Link() {
  return {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#5B0429",
        },
      },
      defaultProps: {
        underline: 'hover'
      }
    }
  };
}
