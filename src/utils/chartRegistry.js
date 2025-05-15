import SeasonalEDChart from "../components/charts/edSeasonalComparisonChart";
import ExampleChart from "../components/charts/ExampleChart";
import LineChart from "../components/charts/LineChart";

const chartRegistry = {
  edSeasonalComparisonChart: SeasonalEDChart, 
  ExampleChart: ExampleChart, 
  lineChart: LineChart,

};

export default chartRegistry;
