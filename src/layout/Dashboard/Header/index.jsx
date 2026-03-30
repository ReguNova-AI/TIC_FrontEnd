import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';

// project import
import AppBarStyled from './AppBarStyled';
import HeaderContent from './HeaderContent';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  // header content
  const headerContent = useMemo(() => <HeaderContent />, []);

  const iconBackColor = 'transparent';
  const iconBackColorOpen = 'transparent';

  // Determine title based on path
  let title = "Dashboard";
  const path = location.pathname.toLowerCase();
  
  if (path.includes('createproject')) {
    title = "Create Project";
  } else if (path.includes('project')) {
    title = "My Projects";
  } else if (path.includes('external')) {
    title = "External Users";
  } else if (path.includes('user')) {
    title = "Users";
  }

  // common header
  const mainHeader = (
    <Toolbar sx={{ p: 0, '&.MuiToolbar-root': { px: 0 }, minHeight: '60px' }}>
      {/* Left Logo Section to match Sidebar Width on Desktop */}
      <Box sx={{ 
        width: downLG ? 'auto' : 260, 
        minWidth: downLG ? 'auto' : 260,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        borderRight: downLG ? 'none' : '1px solid #e0e0e0',
        height: '64px',
        px: downLG ? 2 : '24px',
        bgcolor: '#fff'
      }}>
        <Box sx={{ width: 18, height: 18, bgcolor: '#5B0428', borderRadius: '4px', mr: 1 }} />
        <Typography sx={{ color: '#5B0428', fontWeight: 800, fontSize: '18px', letterSpacing: '0.2px' }}>
          DueDiligence
        </Typography>
      </Box>

      {/* Action Area */}
      <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 1, sm: 2 } }}>
        <IconButton
          disableRipple
          aria-label="open drawer"
          onClick={() => handlerDrawerOpen(!drawerOpen)}
          edge="start"
          color="secondary"
          sx={{ 
            color: 'text.primary', 
            bgcolor: drawerOpen ? iconBackColorOpen : iconBackColor, 
            mr: 1
          }}
        >
          <MenuIcon sx={{ fontSize: '24px', color: '#000' }} />
        </IconButton>
        
        <Typography variant="h6" sx={{ color: '#000', fontWeight: 700, fontSize: '18px' }}>
          {title}
        </Typography>
      </Box>

      {headerContent}
    </Toolbar>
  );

  // app-bar params
  const appBar = {
    position: 'fixed',
    color: 'inherit',
    elevation: 0,
    sx: {
      borderBottom: `1px solid ${theme.palette.divider}`
      // boxShadow: theme.customShadows.z1
    }
  };

  return (
    <>
      {!downLG ? (
        <AppBarStyled open={!!drawerOpen} {...appBar}>
          {mainHeader}
        </AppBarStyled>
      ) : (
        <AppBar {...appBar}>{mainHeader}</AppBar>
      )}
    </>
  );
}
