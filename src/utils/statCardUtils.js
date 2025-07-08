
/**
 * Returns latest percentage value, change from previous week, and formatted date
 * for a given base metric like "ARI", "COVID", etc.
 *
 * @param {Array} data - Full long-form dataset with fields: date, metric, submetric, value
 * @param {string} metricBase - Base name of the metric (e.g. "ARI", "COVID", "RSV", "Influenza")
 * @returns {{
    *   latest: string | null,
    *   change: string | null,
    *   date: string | null,
    *   admitData: { latest: string | null, change: string | null, date: string | null }
    * }}
    */
   export function getStatData(data, metricBase) {
     const visits = data.filter(
       (d) => d.metric === `${metricBase} visits` && d.submetric === "Overall"
     );
     const hospitalizations = data.filter(
       (d) => d.metric === `${metricBase} hospitalizations` && d.submetric === "Overall"
     );
   
     const getLatestAndChange = (series) => {
       const sorted = [...series].sort(
         (a, b) => new Date(a.date) - new Date(b.date)
       );
       const len = sorted.length;
   
       if (len < 2) return { latest: null, change: null, date: null };
   
       const latest = +sorted[len - 1].value;
       const prev = +sorted[len - 2].value;
       const change = latest - prev;
       const trend = change >= 0 ? "▲" : "▼";
       const changeAbs = Math.abs(change).toFixed(1);
       const formatted = `${latest.toFixed(1)}%`;
   
       const date = new Date(sorted[len - 1].date).toLocaleDateString("en-US", {
         month: "numeric",
         day: "numeric",
       });
   
       return {
         latest: formatted,
         change: `${trend} ${changeAbs}%`,
         date: `as of ${date}`,
       };
     };
   
     return {
       ...getLatestAndChange(visits),
       admitData: getLatestAndChange(hospitalizations),
     };
   }
   