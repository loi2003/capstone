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

  let targetGain = preWeight * 0.15; // 15%
  if (targetGain > 12) {
    targetGain = 11; // midpoint of 10–12 kg
  }

  const targetWeight = preWeight + targetGain;

  // 🟢 Lower & Upper recommended now start from Week 1
  const lowerRecommended = weeks.map((_, i) => {
    const progress = i / (40 - 1); // spread across weeks 1–40
    return preWeight + progress * (targetGain * 0.9);
  });

  const upperRecommended = weeks.map((_, i) => {
    const progress = i / (40 - 1);
    return preWeight + progress * (targetGain * 1.1);
  });

  const weightData = journalEntries
    .map((entry) => ({
      x: `Week ${entry.currentWeek}`,
      y: entry.currentWeight,
    }))
    .sort((a, b) => {
      const weekA = parseInt(a.x.replace("Week ", ""), 10);
      const weekB = parseInt(b.x.replace("Week ", ""), 10);
      return weekA - weekB;
    });

  const preWeightData = Array(weeks.length).fill(preWeight);
  // 🟢 Calculate summary values
  const lastWeight = [...journalEntries]
    .sort((a, b) => a.currentWeek - b.currentWeek)
    .pop()?.currentWeight;

  const totalGain = lastWeight ? lastWeight - preWeight : 0;
  const remainingGain = lastWeight ? (targetWeight - lastWeight).toFixed(1) : 0;

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
        font: { size: 18, weight: "bold", color: "#046A8D" },
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

      <div className="weight-gain-summary">
        <h3>CURRENT WEIGHT GAIN RESULTS & RECOMMENDATIONS</h3>
        <ul>
          <li>
            Your weight gain since pregnancy until now is{" "}
            <strong>{totalGain.toFixed(1)} Kg</strong>.
          </li>
          <li>
            According to the recommended weight gain based on pre-pregnancy BMI,
            you need to gain an additional <strong>{remainingGain} Kg</strong>{" "}
            until you are nine months pregnant to ensure the health of both
            mother and baby.
          </li>
          <li>
            You should seek further consultation from doctors and nutrition
            experts regarding your dietary plan.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WeightGainChart;
