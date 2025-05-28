export const getGroupOptions = (data = [], groupField = "submetric", allLabel = "All Groups") => {
    const unique = [...new Set(data.map((d) => d[groupField]).filter(Boolean))];
    return [allLabel, ...unique];
  };
  