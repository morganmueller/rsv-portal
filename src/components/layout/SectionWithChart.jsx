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

  // preview props for the download modal
  previewData = [],
  columnLabels = {},
  downloadDescription = "This will download a CSV of this chart’s currently visible data.",

  // optional view toggle passthroughs for combined-virus, etc.
  viewToggle,
  view,
  onViewChange,
}) => {
  return (
    <ContentContainer
      title={title}
      subtitle={subtitle}
      subtitleVariables={subtitleVariables}
      titleVariables={subtitleVariables}
      infoIcon={infoIcon}
      downloadIcon={downloadIcon}
      modalTitle={modalTitle}
      modalContent={modalContent}
      onDownloadClick={onDownloadClick}
      animateOnScroll={animateOnScroll}

      // IMPORTANT: pass preview props using the names ContentContainer expects
      downloadPreviewData={previewData}
      downloadColumnLabels={columnLabels}
      downloadDescription={downloadDescription}

      // (ContentContainer doesn’t use these two directly; harmless if ignored)
      viewToggle={viewToggle}
      view={view}
      onViewChange={onViewChange}
    >
      {children ?? (
        <ChartContainer title={chartTitle || title} chart={chart} footer={footer} />
      )}
    </ContentContainer>
  );
};

export default SectionWithChart;
