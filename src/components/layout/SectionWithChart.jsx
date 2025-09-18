// SectionWithChart.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import ContentContainer from "./ContentContainer";       // ← use this

const SectionWithChart = ({
  title,
  subtitle,
  subtitleVariables,
  titleVariables,
  children,                // usually a <ChartContainer />
  infoIcon = false,
  downloadIcon = false,
  onDownloadClick,
  modalTitle = "More Info",
  modalContent = null,
  previewData = [],
  columnLabels = {},
  downloadDescription,
  animateOnScroll = true,
  background = "white",
}) => {
  return (
    <ContentContainer
      title={title}
      subtitle={subtitle}
      subtitleVariables={subtitleVariables}
      titleVariables={titleVariables}
      infoIcon={infoIcon}
      downloadIcon={downloadIcon}
      onDownloadClick={onDownloadClick}
      modalTitle={modalTitle}
      modalContent={modalContent}
      downloadPreviewData={previewData}
      downloadColumnLabels={columnLabels}
      downloadDescription={downloadDescription}
      animateOnScroll={animateOnScroll}
      background={background}
    >
      {children}
    </ContentContainer>
  );
};

SectionWithChart.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitleVariables: PropTypes.object,
  children: PropTypes.node.isRequired,
  infoIcon: PropTypes.bool,
  downloadIcon: PropTypes.bool,
  onDownloadClick: PropTypes.func,
  modalTitle: PropTypes.string,
  modalContent: PropTypes.node,
  previewData: PropTypes.array,
  columnLabels: PropTypes.object,
  downloadDescription: PropTypes.string,
  animateOnScroll: PropTypes.bool,
  background: PropTypes.oneOf(["white", "gray", "transparent"]),
};

export default SectionWithChart;
