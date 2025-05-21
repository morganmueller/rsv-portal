// utils/interpolate.js (recommended new file)

export function interpolate(str, variables = {}) {
    return str.replace(/{([^}]+)}/g, (_, key) => variables[key] ?? `{${key}}`);
  }
  