import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { DashboardApiService } from "services/api/DashboardAPIService";
// import { DashboardApiService } from '../../services/api/dashboardAPIService';

const UserWeeklyBarChart = () => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get today's date
  const today = new Date();

  // Get the date 10 days before today
  const lastDate = new Date();
  lastDate.setDate(today.getDate() - 10);

  // Format both dates
  const todayFormatted = formatDate(today);
  const lastDateFormatted = formatDate(lastDate);

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const id = userdetails?.[0]?.user_id;
  const fetchData = () => {
    DashboardApiService.userWeeklyCreatedProject(
      todayFormatted,
      lastDateFormatted
    )
      .then((response) => {
        setChartData(response?.data);
      })
      .catch((errResponse) => {});
  };

  useEffect(() => {
    if (chartRef.current) {
      const myChart = echarts.init(chartRef.current);
      const dates = chartData?.map((item) => item.project_date);
      const projectCounts = chartData.map((item) => item.project_count);

      const option = {
        tooltip: {
          trigger: "axis", // The tooltip will be triggered when hovering over the axis
          formatter: function (params) {
            // Custom formatter for tooltip to show project_date and project_count
            const date = params[0].axisValue;
            const count = params[0].data;
            return `${date}<br />Project Count: ${count}`;
          },
          axisPointer: {
            type: "line", // Line pointer will be shown on hover
            lineStyle: {
              color: "#333", // Line color when hovering
              width: 2, // Line width
            },
          },
        },
        xAxis: {
          type: "category",
          data: dates,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: projectCounts,
            type: "line",
            smooth: true,
          },
        ],
      };

      myChart.setOption(option);

      // Optional: resize the chart when the window resizes
      window.addEventListener("resize", () => myChart.resize());

      // Cleanup on component unmount
      return () => {
        window.removeEventListener("resize", () => myChart.resize());
        myChart.dispose();
      };
    }
  }, [chartData]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default UserWeeklyBarChart;
