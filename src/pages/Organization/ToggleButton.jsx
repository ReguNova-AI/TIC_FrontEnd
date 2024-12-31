import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { UnorderedListOutlined, AppstoreFilled } from '@ant-design/icons';

export default function ToggleButtons({ onViewModeChange,viewSelected }) {
  const [alignment, setAlignment] = React.useState(viewSelected || 'list'); // Default view mode is 'list'

  const handleAlignment = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      onViewModeChange(newAlignment); // Pass the selected view mode to the parent
    }
  };

  return (
    <ToggleButtonGroup
      value={alignment}
      exclusive
      onChange={handleAlignment}
      aria-label="view mode"
    >
      <ToggleButton value="list" aria-label="list view">
        <UnorderedListOutlined />
      </ToggleButton>
      <ToggleButton value="card" aria-label="card view">
        <AppstoreFilled />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
