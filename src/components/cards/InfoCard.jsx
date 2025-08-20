import React from "react";
import PropTypes from "prop-types";
import "./InfoCard.css"; 

const InfoCard = ({ title, icon, description, link, externalIcon }) => {
  const content = (
  <div className="info-card">
    <div className="info-card-row">
    <div className="info-card-left">
    {icon && (
      <img
        className="info-card-icon"
        src={icon}
        alt={`${title} icon`}
      />
    )}
    </div>
      {externalIcon && (
      <img
        className="info-card-external-icon"
        src={externalIcon}
        alt="Opens external resource"
      />
     )}
      </div>
      <h3 className="info-card-title">{title}</h3>

      <p className="info-card-description">{description}</p>
      </div>
    );

  return link ? (
    <a href={link} className="info-card-link" target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    content
  );
};

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  description: PropTypes.string.isRequired,
  link: PropTypes.string,
  externalIcon: PropTypes.string,

};

export default InfoCard;
