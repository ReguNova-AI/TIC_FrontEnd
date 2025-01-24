import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const PieChart = ({data}) => {
  const chartRef = useRef(null);

  const transformedData = data.map(item => ({
    value: item.project_count,
    name: item.org_name
  }));


  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom);

    const option = {
      title: {
        text: '',
        subtext: '',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        // top: '5%',
        orient: 'vertical',
        left: 'right'
      },
      series: [
        {
          name: 'Project Count',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          padAngle: 5,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: transformedData,
        }
      ]
    };

    myChart.setOption(option);

    // Cleanup on unmount
    return () => {
      myChart.dispose();
    };
  }, [data]);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '450px' }} // Set the width and height as needed
    />
  );
};

export default PieChart;
