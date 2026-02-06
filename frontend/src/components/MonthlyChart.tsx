import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface MonthlyChartProps {
  data: {
    labels: string[];
    income: number[];
    expenses: number[];
  };
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Inntekt',
        data: data.income,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Utgifter',
        data: data.expenses,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const formatted = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
            return `${context.dataset.label}: ${formatted} kr`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}k`;
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: 250 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
