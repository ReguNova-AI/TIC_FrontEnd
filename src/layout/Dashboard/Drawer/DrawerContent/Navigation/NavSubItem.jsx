import PropTypes from 'prop-types';
import { forwardRef, useEffect, useState } from 'react';
import { Link, useLocation, matchPath } from 'react-router-dom';

import NavItem from './NavItem';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { DownOutlined , UpOutlined } from '@ant-design/icons';
// project import
import { handlerActiveItem, useGetMenuMaster } from 'api/menu';

import dashboardIcon from "../../../../../assets/images/icons/dashboardIcon.svg";
import organization from "../../../../../assets/images/icons/organization.svg";
import projects from "../../../../../assets/images/icons/projects.svg";
import users from "../../../../../assets/images/icons/users.svg";
import report from "../../../../../assets/images/icons/report.svg";
import certificate from "../../../../../assets/images/icons/certificate.svg";
import dashboard2 from "../../../../../assets/images/icons/dashboard2.svg";
import certificate2 from "../../../../../assets/images/icons/certificate2.svg";
import certificate3 from "../../../../../assets/images/icons/certificate3.svg";
import users2 from "../../../../../assets/images/icons/users2.svg";
import setting from "../../../../../assets/images/icons/setting.svg";
import { Tooltip } from "@mui/material";

function NavSubItem({ item, level }) {
  const theme = useTheme();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const openItem = menuMaster.openedItem;

  const [open, setOpen] = useState(false);  // To handle collapsing of child items

  const { pathname } = useLocation();
  // const isSelected = !!matchPath({ path: item.url, end: false }, pathname) || openItem === item.id;
  const isSelected =false
  let itemTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }
  let listItemProps = { component: forwardRef((props, ref) => <Link ref={ref} {...props} to={item.url} target={itemTarget} />) };
  if (item?.external) {
    listItemProps = { component: 'a', href: item.url, target: itemTarget };
  }

  const icons = {
    dashboard: dashboard2,
    myProject: projects,
    certificateManager: certificate3,
    downloadReports: report,
    users: users2,
    organization: organization,
    configuration: setting, // Default icon
  };

  const Icon = item.icon;
  // const itemIcon = item.icon ? <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} /> : false;
  const itemIcon = item.id ? (
    <img
      src={icons[item.id] || dashboardIcon} // fallback icon
      width={drawerOpen ? "22px" : "27px"}
      alt={`${item.title} icon`} // Add alt for accessibility
    />
  ) : (
    false
  );

  // Handle active item on page load
  useEffect(() => {
    if (pathname === item.url) handlerActiveItem(item.id);
    // eslint-disable-next-line
  }, [pathname]);

  const handleToggle = () => {
    setOpen((prev) => !prev);  // Toggle child item visibility
  };

  const textColor = 'text.primary';
  const iconSelectedColor = "#2ba9bc";

  return (
    <>
      <ListItemButton
        {...listItemProps}
        disabled={item.disabled}
        onClick={() => {
          handlerActiveItem(item.id);
          if (item.children) handleToggle();  // Toggle child items visibility if present
        }}
        // selected={isSelected}
        sx={{
          zIndex: 1201,
          pl: drawerOpen ? `${level * 28}px` : 1.5,
          py: !drawerOpen && level === 1 ? 1.25 : 1,
          mb:drawerOpen ? 1 : 0,
        justifyContent : drawerOpen ? "left" : "center",
          ...(drawerOpen && {
            '&:hover': {
              bgcolor: 'primary.lighter',
            },
            '&.Mui-selected': {
              bgcolor: 'primary.lighter',
              borderRight: `2px solid ${iconSelectedColor}`,
              color: iconSelectedColor,
              '&:hover': {
                color: iconSelectedColor,
                bgcolor: 'primary.lighter',
              },
            },
          }),
          ...(!drawerOpen && {
            '&:hover': {
              bgcolor: 'transparent',
            },
            '&.Mui-selected': {
              '&:hover': {
                bgcolor: 'transparent',
              },
              bgcolor: 'transparent',
            },
          }),
        }}
      >
        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: isSelected ? iconSelectedColor : textColor,
              justifyContent : drawerOpen ? "left" : "center",
              ...(!drawerOpen && {
                borderRadius: 1.5,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: 'secondary.lighter',
                },
              }),
              ...(!drawerOpen &&
                isSelected && {
                  bgcolor: 'primary.lighter',
                  '&:hover': {
                    bgcolor: 'primary.lighter',
                  },
                }),
            }}
          >
            {!drawerOpen ? <Tooltip title={item.title}> {itemIcon}</Tooltip> :itemIcon}
          </ListItemIcon>
        )}
        {(drawerOpen || (!drawerOpen && level !== 1)) && (
          <ListItemText
            primary={
              <Typography variant="h6" sx={{ ml:1, color: isSelected ? iconSelectedColor : textColor , fontSize:"0.875rem",fontWeight:isSelected ?500 : 400}}>
                {item.title}
              </Typography>
            }
          />
        )}
        {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
          <Chip
            color={item.chip.color}
            variant={item.chip.variant}
            size={item.chip.size}
            label={item.chip.label}
            avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
          />
        )}
        {item.children && (
          <ListItemIcon
            sx={{
              minWidth: 28,
              fontSize:"11px",
              color: "aeaeae",
              paddingLeft:"20px"
            }}
          >
            {open ? <UpOutlined /> : <DownOutlined />}
          </ListItemIcon>
        )}
      </ListItemButton>

      {item.children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <div >
            {item.children.map((child) => (
              <NavItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        </Collapse>
      )}
    </>
  );
}

NavItem.propTypes = {
  item: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired,
};

export default NavSubItem;
