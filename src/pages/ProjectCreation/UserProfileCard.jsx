import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { DeleteFilled } from '@ant-design/icons';
import '../../utils/styles.css';
import profileImage from '../../assets/images/users/avatar-4.png'

const UserProfileCard = (props) => {
  const handleDelete = (value) => {
    props.onDelete(value);
  };

  return (
    <Box style={{ minWidth: "240px",boxShadow: "0px 0px 12px #e4e4e4", border: "1px solid #e8e8e8",borderRadius:"10px"}}>
      <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center',borderRadius:"10px" }}>
        {/* Profile Image */}
        <Box sx={{ padding: '0px 16px' }}>
          <Avatar alt={props.name} src={profileImage} sx={{ width: 45, height: 45 }} />
        </Box>

        {/* Profile Details */}
        <Box sx={{ flexGrow: 1, padding: '10px 0px' }}>
          <CardContent style={{ padding: '0px' }}>
            <Typography variant="h6" component="div" className="ellipsis-text">
              {props.name}
            </Typography>
            <Typography variant="body2" className="ellipsis-text" sx={{ color: 'text.secondary' }}>
              {props.role} {props.id}
            </Typography>
          </CardContent>

          <CardActions style={{ padding: '0px 10px', float: 'right' }}>
            <Button onClick={(e) => handleDelete(props.id)} style={{ padding: 0, minWidth: '30px' }}>
              <DeleteFilled style={{ color: '#f5222d' }} />
            </Button>
          </CardActions>
        </Box>
      </Card>
    </Box>
  );
};

export default UserProfileCard;
