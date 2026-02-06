import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface NetWorthChartProps {
  data: { month: string; netWorth: number }[];
}

export default function NetWorthChart({ data }: NetWorthChartProps) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Nettoverdi',
        data: data.map(d => d.netWorth),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = Math.round(context.raw);
            const formatted = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
            return `Nettoverdi: ${formatted} kr`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `${(value / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  return (
    <div style={{ height: 300 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
