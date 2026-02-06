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

interface ForecastChartProps {
  data: { month: string; balance: number }[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Forventet saldo',
        data: data.map(d => d.balance),
        borderColor: data.some(d => d.balance < 0) ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)',
        backgroundColor: data.some(d => d.balance < 0)
          ? 'rgba(239, 68, 68, 0.1)'
          : 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        borderDash: [5, 5],
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
            return `Forventet: ${formatted} kr`;
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
