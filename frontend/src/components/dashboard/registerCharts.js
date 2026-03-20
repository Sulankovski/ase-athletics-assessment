import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  ArcElement,
  RadarController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

let registered = false;

export function registerDashboardCharts() {
  if (registered) return;
  ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    ArcElement,
    RadarController,
    Title,
    Tooltip,
    Legend,
    Filler,
  );
  registered = true;
}
