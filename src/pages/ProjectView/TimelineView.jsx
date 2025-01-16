import React from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Timeline } from 'antd';

const TimelineView = () => {
 return ( <Timeline
    mode="left"
    items={[
      {
        children: 'Create a project on 2015-09-01',
      },
      {
        children: 'Documents uploaded 2015-09-01',
        color: 'green',
      },
      {
        dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
        children: `In progess `,
      },
      {
        color: 'red',
        children: 'Failed to generate checklist report',
      },
      {
        children: 'Re run the project on 2015-09-01',
      },
      {
        dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
        children: 'Report generation in progress',
      },
    ]}
  />);
};

export default TimelineView;