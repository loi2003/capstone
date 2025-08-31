import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./WeightGainChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeightGainChart = ({ journalEntries = [], preWeight = 0 }) => {
  const weeks = Array.from({ length: 40 }, (_, i) => `Week ${i + 1}`);

  // 🟢 Calculate recommended weight gain target
  let targetGain = preWeight * 0.15; // 15%
  if (targetGain > 12) {
    targetGain = 11; // midpoint of 10–12 kg
  }

  const targetWeight = preWeight + targetGain;

  // 🟢 Build lower & upper recommended bands
  const lowerRecommended = weeks.map((_, i) => {
    if (i < 12) return preWeight; // first trimester: baseline
    // distribute from week 13–40
    const progress = (i - 12) / (40 - 12);
    return preWeight + progress * (targetGain * 0.9); // 90% of target as lower bound
  });

  const upperRecommended = weeks.map((_, i) => {
    if (i < 12) return preWeight;
    const progress = (i - 12) / (40 - 12);
    return preWeight + progress * (targetGain * 1.1); // 110% of target as upper bound
  });

  const weightData = journalEntries.map((entry) => ({
    x: `Week ${entry.currentWeek}`,
    y: entry.currentWeight,
  }));

  const preWeightData = Array(weeks.length).fill(preWeight);

  const data = {
    labels: weeks,
    datasets: [
      {
        label: "Recorded Weight (Kg)",
        data: weightData, 
        borderColor: "#3498db",
        backgroundColor: "rgba(52, 152, 219, 0.2)",
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#3498db",
      },
      {
        label: "Pre-Pregnancy Weight",
        data: preWeightData,
        borderColor: "#e74c3c",
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Upper Recommended",
        data: upperRecommended,
        borderColor: "rgba(46, 204, 113, 0.8)",
        backgroundColor: "rgba(46, 204, 113, 0.2)",
        fill: "-1", // fills to previous dataset (lower)
        pointRadius: 0,
      },
      {
        label: "Lower Recommended",
        data: lowerRecommended,
        borderColor: "rgba(46, 204, 113, 0.8)",
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Weight Gain Progress (Weeks 1–40)",
        font: { size: 18, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y} Kg`,
        },
      },
    },
    scales: {
      x: {
        ticks: { autoSkip: true, maxRotation: 0 },
      },
      y: {
        title: {
          display: true,
          text: "Weight (Kg)",
        },
        ticks: {
          callback: (val) => `${val} Kg`,
        },
      },
    },
  };

  return (
    <div className="weight-gain-chart-container">
      <Line data={data} options={options} />
    </div>
  );
};

export default WeightGainChart;
