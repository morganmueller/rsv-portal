import React from "react";
import ContentContainer from "./ContentContainer";
import ChartContainer from "./ChartContainer";

const SectionWithChart = ({
  title,
  subtitle,
  subtitleVariables,
  infoIcon,
  downloadIcon,
  modalTitle,
  modalContent,
  onDownloadClick,
  chartTitle,
  chart,
  footer,
  children,
  animateOnScroll,
  previewData = [],
  columnLabels = {},

}) => {
  return (
    <ContentContainer
      title={title}
      subtitle={subtitle}
      subtitleVariables={subtitleVariables}
      infoIcon={infoIcon}
      downloadIcon={downloadIcon}
      modalTitle={modalTitle}
      modalContent={modalContent}
      onDownloadClick={onDownloadClick}
      animateOnScroll={animateOnScroll}
      previewData={previewData}
      columnLabels={columnLabels}

    >
      {children ?? (
        <ChartContainer title={chartTitle || title} chart={chart} footer={footer} />
      )}
    </ContentContainer>
  );
};

export default SectionWithChart;
