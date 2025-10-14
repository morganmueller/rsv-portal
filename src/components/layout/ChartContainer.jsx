import React from "react";
import PropTypes from "prop-types";
import AccessibleTable from "../accessibility/AccessibleTable";

import "./ChartContainer.css";      
// import "../styles/accessible-table.css"; // ← adjust path if needed

const ChartContainer = ({
  title,
  subtitle,
  chart,
  sidebar,
  footer,
  stackSidebarAbove = false,
  altTableData,
  altTableColumns,
  altTableCaption,
  altTableSrOnly = true,
  altTableLabelledBy, 
  altTableVariables = {},
  disableAltTable = false,
}) => {
    const hasAltTable = !disableAltTable && Array.isArray(altTableData) && altTableData.length > 0;

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-title-section">
          {/* <h2 id="chart-title" className="chart-title">{title}</h2>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>} */}
        </div>
      </div>

      <div className={`chart-content ${stackSidebarAbove ? "stack" : "side"}`}>
        {sidebar && (
          <div className={`chart-sidebar ${stackSidebarAbove ? "stack" : ""}`}>
            {sidebar}
          </div>
        )}

        <div className="chart-body">
          {/* Hide the visual Vega chart from screen readers */}
          {chart && (
            <div className="chart-vega" aria-hidden="true">
              {chart}
            </div>
          )}

          {/* Accessible data table (screenreader visible by default) */}
          {hasAltTable && (
            <div className="chart-alt-table">
              <AccessibleTable
                data={altTableData}
                columns={altTableColumns}
                caption={altTableCaption || title}
                srOnly={altTableSrOnly}
                labelledBy={altTableLabelledBy}
                allowToggleForSighted
                variables={altTableVariables}
              />
            </div>
          )}
        </div>
      </div>

      {footer && <div className="chart-footer">{footer}</div>}
    </div>
  );
};

ChartContainer.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.node,
  chart: PropTypes.node,
  sidebar: PropTypes.node,
  footer: PropTypes.node,
  stackSidebarAbove: PropTypes.bool,
  altTableData: PropTypes.arrayOf(PropTypes.object),
  altTableVariables: PropTypes.object,
  altTableColumns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      format: PropTypes.oneOf(["text", "number", "percent", "date", "passthrough"]),
    })
  ),
  altTableCaption: PropTypes.string,
  altTableSrOnly: PropTypes.bool,
  altTableLabelledBy: PropTypes.string,
  disableAltTable: PropTypes.bool,

};

export default ChartContainer;
