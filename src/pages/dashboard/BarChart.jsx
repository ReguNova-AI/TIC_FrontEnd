import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { DashboardApiService } from 'services/api/dashboardAPIService';
// import { DashboardApiService } from '../../services/api/dashboardAPIService';

const BarChart = ({data}) => {
  // Create a reference to the chart container
  const chartRef = useRef(null);
  const [chartData,setChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
    const id = userdetails?.[0]?.user_id;

    const fetchData = ()=>{

    
    DashboardApiService.topprojectIndustryVise()
      .then((response) => {
        setChartData(response?.data)
       
      })
      .catch((errResponse) => {
       
      });
    }

  useEffect(() => {
    // Initialize the chart when the component is mounted
    const myChart = echarts.init(chartRef.current);
    const industries = chartData.map(item => item.industry_name);
    const projectCounts = chartData.map(item => item.project_count);

    // Chart options
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: industries,
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            rotate: 45, // Set the angle of the x-axis labels to 45 degrees (you can adjust this value)
            interval: 0, // Optional: Display all labels
            formatter: function (value) {
              return value.length > 20 ? value.substring(0, 20) + "..." : value; // Truncate long labels if needed
            }
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: 'Project Count',
          type: 'bar',
          barWidth: '60%',
          data: projectCounts
        }
      ]
    };

    // Set the chart option
    myChart.setOption(option);

    // Resize the chart on window resize
    window.addEventListener('resize', () => myChart.resize());

    // Cleanup on component unmount
    return () => {
      myChart.dispose();
      window.removeEventListener('resize', () => myChart.resize());
    };
  }, [chartData]);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '400px' }} // You can adjust the height and width
    />
  );
};

export default BarChart;
