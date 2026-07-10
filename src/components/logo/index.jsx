import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import config from 'config';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = ({ sx, to }) => (
  <Link
    to={to || config.defaultPath}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      textDecoration: 'none',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      ...sx,
    }}
  >
    <img src="/DDlogo.webp" width="125" height="auto" alt="Logo" fetchpriority="high" />
  </Link>
);

LogoSection.propTypes = {
  sx: PropTypes.object,
  to: PropTypes.string,
};

export default LogoSection;