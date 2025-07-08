import React from "react";
import { useParams } from "react-router-dom";
import DataPageLayout from "../../components/layout/DataPageLayout"; 
import "./DataExplorer.css";

const topicLabels = {
  "ed-visits": "Emergency Department Visits & Hospitalizations",
  "cases": "Laboratory-reported Cases",
  "deaths": "COVID-19 Deaths",
};

const DataExplorer = () => {
  const { topic } = useParams();
  const title = topicLabels[topic] || "Data Explorer";

  return (
    <DataPageLayout
      title={title}
      subtitle="Explore NYC public health trends by topic"
    >
      {/* Data visualizations for the selected topic would go here */}
      <div style={{ padding: "24px", color: "#6B7280" }}>
        Charts and data for <strong>{title}</strong> will appear here.
      </div>
    </DataPageLayout>
  );
};

export default DataExplorer;
