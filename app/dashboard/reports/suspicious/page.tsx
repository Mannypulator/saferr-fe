"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import ProtectedRoute from "@/components/ProtectedRoute";

interface SuspiciousActivity {
  securityCodeId: string;
  code: string;
  verificationCount: number;
  firstVerification: string;
  lastVerification: string;
  productId: string;
  productName: string;
  brandId: string;
  brandName: string;
}

export default function SuspiciousActivitiesPage() {
  const [activities, setActivities] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<SuspiciousActivity[]>(
          `/reporting/suspicious?limit=${limit}`
        );
        setActivities(response.data);
      } catch (err: any) {
        console.error("Failed to fetch suspicious activities:", err);
        setError("Failed to load suspicious activities.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
  };

  if (loading)
    return (
      <div className="text-center py-10">Loading suspicious activities...</div>
    );
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Suspicious Activities
        </h1>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">
              Potential Counterfeit Verifications
            </h2>
            <div>
              <label htmlFor="limit" className="mr-2 text-sm text-gray-700">
                Show:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={handleLimitChange}
                className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Codes verified multiple times may indicate counterfeiting attempts.
          </p>
        </div>

        {activities.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Brand
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Verifications
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    First Verified
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Verified
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr
                    key={activity.securityCodeId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {activity.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.brandName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-600">
                      {activity.verificationCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.firstVerification).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.lastVerification).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No Suspicious Activities Found
            </h3>
            <p className="mt-1 text-gray-500">
              There are currently no codes that have been verified multiple
              times.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
