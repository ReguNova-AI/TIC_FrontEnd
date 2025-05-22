import PropTypes from "prop-types";
// material-ui
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// project import
import NavItem from "./NavItem";

import { useGetMenuMaster } from "api/menu";
import NavSubItem from "./NavSubItem";

export default function NavGroup({ item }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const userRole = userdetails?.[0]?.role_name;
  const isExternalUser = userdetails?.[0]?.is_external_user || false;
  console.log("userRole", userdetails?.[0]?.is_external_user);

  const navCollapse = item.children?.map((menuItem) => {
    switch (menuItem.type) {
      case "collapse":
        // If it's a collapsible group of items, render the NavSubItem
        return <NavSubItem key={menuItem.id} item={menuItem} level={1} />;

      case "item":
        // Hide "External Projects" tab for non-external users
        if (menuItem.id === "externalProjects" && !isExternalUser) {
          return null;
        }

        // Hide "Certificate Manager" tab for external users
        // if (menuItem.id === "certificateManager" && isExternalUser) {
        //   return null;
        // }

        // Hide "My Projects" tab or "Certificate Manager" tab for external users with role "External"
        if (
          (menuItem.id === "myProject" ||
            menuItem.id === "certificateManager") &&
          isExternalUser &&
          userRole === "External"
        ) {
          return null;
        }

        // Check if the menu item is accessible based on the user's role
        if (
          menuItem.access.includes("all") ||
          menuItem.access.includes(userRole)
        ) {
          // If user is Super Admin but the item is not meant for Super Admin, skip it
          if (
            userRole === "Super Admin" &&
            menuItem.superAdminAccess !== true
          ) {
            return null;
          }

          // Render the NavItem if all checks pass
          return <NavItem key={menuItem.id} item={menuItem} level={1} />;
        }

        // If none of the conditions are met, skip the menu item
        return null;

      default:
        // For unknown types, show an error message in red
        return (
          <Typography
            key={menuItem.id}
            variant="h6"
            color="error"
            align="center"
          >
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  });

  return (
    <List
      subheader={
        item.title &&
        drawerOpen && (
          <Box sx={{ pl: 3, mb: 1.5 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {item.title}
            </Typography>
            {/* only available in paid version */}
          </Box>
        )
      }
      sx={{ mb: drawerOpen ? 1.5 : 0, py: 0, zIndex: 0 }}
    >
      {navCollapse}
    </List>
  );
}

NavGroup.propTypes = { item: PropTypes.object };
