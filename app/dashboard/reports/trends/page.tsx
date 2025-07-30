"use client";

// pages/dashboard/reports/trends.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import ProtectedRoute from '@/components/ProtectedRoute';
// --- Import Recharts components ---
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// ---------------------------------

// Define type for trend data (assuming this is already defined)
interface DailyVerificationCount {
  date: string; // ISO string from backend
  count: number;
}

interface VerificationTrendData {
  dailyCounts: DailyVerificationCount[];
  totalVerifications: number;
}

const VerificationTrends = () => {
  const [trendData, setTrendData] = useState<VerificationTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // Today
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange.start || !dateRange.end) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<VerificationTrendData>(
          `/reporting/trends?startDate=${encodeURIComponent(
            dateRange.start
          )}&endDate=${encodeURIComponent(dateRange.end)}`
        );
        setTrendData(response.data);
        // For the 'any' type errors, add this above the line:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Failed to fetch trends:', err);
        setError('Failed to load verification trends.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  // --- Prepare data for Recharts ---
  // Recharts expects data points as objects. Our data is already in a suitable format,
  // but we might want to format the date for display on the X-axis.
  const chartData = trendData?.dailyCounts.map(item => ({
    // Format date for tooltip/display
    name: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    // Use the full date object or ISO string for sorting if needed, or just the formatted name
    date: item.date, // Keep original for sorting if necessary
    count: item.count,
  })) || [];
  // ---------------------------------

  if (loading) return <div className="text-center py-10">Loading trends...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Verification Trends</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Filter by Date Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                max={dateRange.end}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                min={dateRange.start}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {trendData && (
          <>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
              <p className="text-gray-700">
                Total verifications in selected period: <span className="font-semibold">{trendData.totalVerifications.toLocaleString()}</span>
              </p>
            </div>

            {/* --- Chart Visualization --- */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Verification Counts (Chart)</h2>
              {chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                         formatter={(value) => [value, 'Verifications']}
                         labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Verifications"
                        stroke="#4f46e5" // Indigo color, matches theme
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No data available for the selected period.
                </div>
              )}
            </div>
            {/* -------------------------- */}

            {/* --- Data Table (Optional, keep for detail) --- */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Verification Counts (Table)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trendData.dailyCounts.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{item.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* ------------------------------------------------ */}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default VerificationTrends;