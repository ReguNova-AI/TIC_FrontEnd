import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { DashboardApiService } from "services/api/DashboardAPIService";

const UserWeeklyBarChart = () => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const lastDate = new Date();
  lastDate.setDate(today.getDate() - 10);

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
        // ensure it's always an array
        const data = Array.isArray(response?.data) ? response.data : [];
        setChartData(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (chartRef.current) {
      const myChart = echarts.init(chartRef.current);
      console.log("chartData", chartData);

      const dates = Array.isArray(chartData)
        ? chartData.map((item) => item.project_date)
        : [];

      const projectCounts = Array.isArray(chartData)
        ? chartData.map((item) => item.project_count)
        : [];

      const option = {
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            const date = params[0].axisValue;
            const count = params[0].data;
            return `${date}<br />Project Count: ${count}`;
          },
          axisPointer: {
            type: "line",
            lineStyle: {
              color: "#333",
              width: 2,
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

      const handleResize = () => myChart.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        myChart.dispose();
      };
    }
  }, [chartData]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default UserWeeklyBarChart;
