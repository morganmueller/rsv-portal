import SeasonalEDChart from "../components/charts/edSeasonalComparisonChart";
import ExampleChart from "../components/charts/ExampleChart";
import LineChart from "../components/charts/LineChart";
import YearComparisonChart from "../components/charts/YearComparisonChart"
const chartRegistry = {
  edSeasonalComparisonChart: SeasonalEDChart, 
  ExampleChart: ExampleChart, 
  lineChart: LineChart,
  yearComparisonChart: YearComparisonChart

};

export default chartRegistry;
