import SeasonalEDChart from "../components/charts/edSeasonalComparisonChart";
import ExampleChart from "../components/charts/ExampleChart";
import LineChart from "../components/charts/LineChart";
import YearComparisonChart from "../components/charts/YearComparisonChart"
import SmallMultipleBarChart from "../components/charts/SmallMultipleBarChart"

const chartRegistry = {
  edSeasonalComparisonChart: SeasonalEDChart, 
  ExampleChart: ExampleChart, 
  lineChart: LineChart,
  yearComparisonChart: YearComparisonChart,
  smallMultipleBarChart: SmallMultipleBarChart

};

export default chartRegistry;