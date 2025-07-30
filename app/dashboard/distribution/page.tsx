// pages/dashboard/reports/distribution.tsx
"use client";
import React, { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import ProtectedRoute from "@/components/ProtectedRoute";
// --- Import Recharts components ---
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
// ---------------------------------

// Define types (assuming these are already defined or can be imported)
interface ProductVerificationCount {
  productId: string;
  productName: string;
  brandId: string;
  brandName: string;
  verificationCount: number;
}

interface ProductDistributionData {
  topProducts: ProductVerificationCount[];
  totalProducts: number;
}

const ProductDistribution = () => {
  const [distributionData, setDistributionData] =
    useState<ProductDistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<ProductDistributionData>(
          `/reporting/product-distribution`
        );
        setDistributionData(response.data);
        // For the 'any' type errors, add this above the line:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Failed to fetch product distribution:", err);
        setError("Failed to load product distribution data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Prepare data for Recharts ---
  // Truncate long product names for better chart display
  const truncateLabel = (str: string, maxLength: number = 15) => {
    return str.length > maxLength
      ? `${str.substring(0, maxLength - 3)}...`
      : str;
  };

  const chartData =
    distributionData?.topProducts.map((product, index) => ({
      ...product,
      // Truncate product name for X-axis
      name: truncateLabel(product.productName),
      // Optional: Add a color based on rank or value
      color: index === 0 ? "#10b981" : "#6366f1", // Highlight #1 product
    })) || [];
  // ---------------------------------

  if (loading)
    return (
      <div className="text-center py-10">Loading product distribution...</div>
    );
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!distributionData)
    return <div className="text-center py-10">No data available.</div>;

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Product Verification Distribution
        </h1>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Overview</h2>
          <p className="text-gray-700">
            Total distinct products in system:{" "}
            <span className="font-semibold">
              {distributionData.totalProducts.toLocaleString()}
            </span>
          </p>
        </div>

        {/* --- Chart Visualization --- */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Top Verified Products (Chart)
          </h2>
          {chartData.length > 0 ? (
            <div className="h-96">
              {" "}
              {/* Increased height for bar chart */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20, // Adjust left margin if labels are long
                    bottom: 60, // Increase bottom margin for X-axis labels
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45} // Angle labels for better fit
                    textAnchor="end"
                    height={60} // Allocate space for angled labels
                    tick={{ fontSize: 12 }} // Adjust font size if needed
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name, props) => {
                      // Find the full product name for tooltip
                      const fullProductName =
                        distributionData.topProducts[props.payload.index]
                          ?.productName || props.payload.productName;
                      return [value, `Verifications for ${fullProductName}`];
                    }}
                    labelFormatter={(value) => `Product: ${value}`} // Use truncated name from dataKey
                  />
                  <Legend />
                  <Bar dataKey="verificationCount" name="Verifications">
                    {/* Color bars individually */}
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No verification data available.
            </div>
          )}
        </div>
        {/* -------------------------- */}

        {/* --- Data Table (Optional, keep for detail) --- */}
        {distributionData.topProducts.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rank
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
                    Share
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {distributionData.topProducts.map((product, index) => {
                  const percentage =
                    distributionData.topProducts[0].verificationCount > 0
                      ? (
                          (product.verificationCount /
                            distributionData.topProducts[0].verificationCount) *
                          100
                        ).toFixed(1)
                      : "0.0";
                  return (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.brandName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {product.verificationCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span>{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No Verification Data
            </h3>
            <p className="mt-1 text-gray-500">
              No products have been verified yet.
            </p>
          </div>
        )}
        {/* ------------------------------------------------ */}
      </div>
    </ProtectedRoute>
  );
};

export default ProductDistribution;
