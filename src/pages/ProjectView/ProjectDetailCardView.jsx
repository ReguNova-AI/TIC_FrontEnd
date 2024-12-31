import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Chip, Grid, Box, Divider } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import avatar1 from '../../assets/images/users/avatar-1.png';
import avatar2 from '../../assets/images/users/avatar-2.png';
import avatar3 from '../../assets/images/users/avatar-3.png';

// Function to generate the status chip for each status
const getStatusChip = (status) => {
  let color;
  let borderColor;
  let title;

  switch (status) {
    case 'In Progress':
      color = '#fffbe6';
      borderColor = 'warning';
      title = 'In Progress';
      break;
    case 'Success':
      color = '#f6ffed';
      borderColor = 'success';
      title = 'Success';
      break;
    case 'Failed':
      color = '#fff1f0';
      borderColor = 'error';
      title = 'Failed';
      break;
    default:
      color = '#e6f7ff';
      borderColor = 'primary';
      title = 'None';
  }

  return (
    <Chip
      key={status}
      label={title}
      color={borderColor}
      variant="outlined"
      sx={{
        bgcolor: color,
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        margin: '1px', // Optional to add some spacing between chips
      }}
    />
  );
};

// Function to render the Avatar Group
const AvatarSection = () => (
  <AvatarGroup spacing="medium">
    <Avatar alt="Remy Sharp" src={avatar1} sx={{ width: 30, height: 30 }} />
    <Avatar alt="Travis Howard" src={avatar2} sx={{ width: 30, height: 30 }} />
    <Avatar alt="Cindy Baker" src={avatar3} sx={{ width: 30, height: 30 }} />
  </AvatarGroup>
);

const ProjectDetailsCardView = ({ data }) => {
  return (
    <Grid container >
      <Grid item xs={12} sm={12} md={12} key="#dfds">
        <Card sx={{ borderRadius: '10px' }} style={{ boxShadow: '0px 7px 15px #d7d5d5', border: '1px solid #ececec' }}>
          <CardContent >
            {/* Wrap project name and status in a Box */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">TEST project</Typography>

              {/* Render Chips for each status, floated to the right */}
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>{getStatusChip("In Progress")}</div>
            </Box>

            {/* Project No and Industry in a row */}
            <Box sx={{ marginTop: '10px' }}>
              <Grid container spacing={3} alignItems="center">
                {/* Labels */}
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.primary">
                    <b>Project No:</b>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    #dfs43534
                  </Typography>
                </Grid>
                
                <Divider orientation="vertical" flexItem sx={{ margin: '0 10px' }} />  {/* Vertical divider between labels */}

                <Grid item xs={3}>
                  <Typography variant="body2" color="text.primary">
                    <b>Mapping Standards:</b>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    sSDKNJ#$%dfs454
                  </Typography>
                </Grid>
                
                <Divider orientation="vertical" flexItem sx={{ margin: '0 10px' }} />  {/* Vertical divider between labels */}

                <Grid item xs={3}>
                  <Typography variant="body2" color="text.primary">
                    <b>Industry:</b>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manufacturing
                  </Typography>
                </Grid>
              </Grid>
              
             
            </Box>

          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProjectDetailsCardView;
