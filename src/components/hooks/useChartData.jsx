import { useEffect, useState } from "react";

const useChartData = () => {
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with real data fetch
    fetch("/data/covid_visits.json")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  return { data, isLoading };
};

export default useChartData;
