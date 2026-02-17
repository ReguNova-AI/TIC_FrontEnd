export default function ListItemButton(theme) {
  const { palette } = theme;

  return {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          // 🔹 Selected state
          '&.Mui-selected': {
            color: palette.primary.main, 
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent'
            }
          },

          // 🔹 NOT selected → hover effect
          '&:not(.Mui-selected):hover': {
            color: palette.primary.main, 
            backgroundColor: 'transparent'

          }
        }
      }
    }
  };
}
