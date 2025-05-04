import React from "react";
import InfoBox from "../../components/InfoBox";
import "./OverviewSection.css";

const OverviewSection = () => {
  return (
    <section className="overview-section">
  <div className="overview-container">
    <div className="overview-columns">
      <div className="overview-column">
        {/* <h2>Learn about Respiratory Viruses</h2> */}
        <InfoBox title="Overview">
          Respiratory viruses such as COVID-19, influenza, and RSV affect thousands of New Yorkers every year...
        </InfoBox>
      </div>

      <div className="overview-column">
        {/* <h2>How to use this site</h2> */}
        <InfoBox title="Using This Portal">
          Use the top navigation to explore key metrics such as emergency department visits...
        </InfoBox>
      </div>
    </div>
  </div>
</section>

  );
};

export default OverviewSection;
