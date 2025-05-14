import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { TaskStats } from '../types';
import { LineChart as ChartLine } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Progress: React.FC = () => {
  const { currentUser } = useAuth();
  const [taskStats, setTaskStats] = useState<TaskStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchTaskStats();
    }
  }, [currentUser]);

  const fetchTaskStats = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser?.uid),
        where('completed', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const stats: { [key: string]: number } = {};
      
      querySnapshot.forEach((doc) => {
        const task = doc.data();
        const date = new Date(task.completedAt).toLocaleDateString();
        stats[date] = (stats[date] || 0) + 1;
      });

      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString();
      }).reverse();

      const formattedStats: TaskStats[] = last7Days.map(date => ({
        date,
        count: stats[date] || 0
      }));

      setTaskStats(formattedStats);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: taskStats.map(stat => stat.date),
    datasets: [
      {
        label: 'Tasks Completed',
        data: taskStats.map(stat => stat.count),
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Progress" />
      
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md-soft p-6"
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : taskStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChartLine className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No completed tasks yet. Start completing tasks to see your progress!</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Tasks Completed (Last 7 Days)</h2>
              <div className="h-[300px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </>
          )}
        </motion.div>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Progress;