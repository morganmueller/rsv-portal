import React from "react";
import PropTypes from "prop-types";
import GroupDropdown from "./GroupDropdown";

/**
 * Renders a subtitle string with optional React components (e.g., dropdown).
 * Looks for `{group}` token and replaces with a <GroupDropdown />.
 */
const TrendSubtitle = ({ template, variables = {}, groupProps }) => {
  if (!template) return null;

  const parts = template.split(/({group})/g); // Split by token

  return (
    <span className="chart-subtitle" style={{ margin: "8px 0", display: "inline-flex", flexWrap: "wrap", alignItems: "center" }}>
      {parts.map((part, idx) => {
        if (part === "{group}") {
          return (
            <GroupDropdown
              key={idx}
              options={groupProps.options}
              active={groupProps.active}
              onChange={groupProps.onChange}
              label=""
              inline
            />
          );
        }

        const interpolated = part.replace(/{(\w+)}/g, (_, key) => {
          return variables[key] ?? `{${key}}`;
        });

        return (
          <span
            key={idx}
            dangerouslySetInnerHTML={{ __html: interpolated }}
          />
        );
        
      })}
    </span>
  );
};

TrendSubtitle.propTypes = {
  template: PropTypes.string,
  variables: PropTypes.object,
  groupProps: PropTypes.shape({
    options: PropTypes.array.isRequired,
    active: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }),
};

export default TrendSubtitle;
