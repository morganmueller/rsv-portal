import React from "react";
import StatCard from "../StatCard"; // make sure this path is correct
import "./StatGrid.css"; // if you have any custom styles
import covidIcon from "../../../public/assets/covid-vector.svg";
import fluIcon from "../../../public/assets/flu-vector.svg";
import rsvIcon from "../../../public/assets/rsv-vector.svg";
import ariIcon from "../../../public/assets/ari-vector.svg";


const StatGrid = () => {
  const data = [
    {
      title: "Acute Respiratory Infections",
      year: "2025",
      icon: ariIcon,
      visitPercent: "3.8%",
      admitPercent: "2.5%",
      visitChange: "9% from last week",
      admitChange: "6% from last week",
      subtitle: "Emergency Department",
      backgroundColor: "#F4C4A5"
    },
    {
      title: "COVID-19",
      year: "2025",
      icon: covidIcon,
      visitPercent: "1.2%",
      admitPercent: "0.8%",
      visitChange: "12% from last week",
      admitChange: "12% from last week",
      subtitle: "Emergency Department",
      backgroundColor: "#EFF6FF"
    },
    {
      title: "Influenza",
      year: "2025",
      icon: fluIcon,
      visitPercent: "4.3%",
      admitPercent: "3.1%",
      visitChange: "8% from last week",
      admitChange: "7% from last week",
      subtitle: "Emergency Department",
      backgroundColor: "#F5F3FF"
    },
    {
      title: "RSV",
      year: "2025",
      icon: rsvIcon,
      visitPercent: "2.3%",
      admitPercent: "1.2%",
      visitChange: "5% from last week",
      admitChange: "4% from last week",
      subtitle: "Emergency Department",
      backgroundColor: "#ECFDF5"
    }
  ];
  

  return (
    <div className="stat-grid">
      {data.map((item, index) => (
        <StatCard key={index} {...item} />
      ))}
    </div>
  );
};

export default StatGrid;
