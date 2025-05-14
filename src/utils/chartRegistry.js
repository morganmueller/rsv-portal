import SeasonalEDChart from "../components/charts/edSeasonalComparisonChart";
import ExampleChart from "../components/charts/ExampleChart";
import LineChart from "../components/charts/LineChart";

const chartRegistry = {
  edSeasonalComparisonChart: SeasonalEDChart, 
  ExampleChart: ExampleChart, // key must match config
  lineChart: LineChart,

};

export default chartRegistry;
