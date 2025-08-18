import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

// project import
import Logo from './LogoMain';
import config from 'config';
import logo from '../../assets/images/GridConform.png';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = ({ sx, to }) => {
  return (
    <ButtonBase disableRipple component={Link} to={!to ? config.defaultPath : to} sx={sx}>
        {/* <Logo /> */}
        <img src={logo } width='180px'/>
    </ButtonBase>
  );
};

LogoSection.propTypes = {
  sx: PropTypes.object,
  to: PropTypes.string
};

export default LogoSection;
