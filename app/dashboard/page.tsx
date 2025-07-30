// app/(dashboard)/reports/distribution/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient"; // Adjust import path as needed
import ProtectedRoute from "@/components/ProtectedRoute"; // Adjust import path as needed
import { useAuth } from "@/context/AuthContext"; // Adjust import path as needed
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

// Define types based on backend DTOs (adjust as per your actual types)
interface ProductVerificationCount {
  productId: string;
  productName: string;
  brandId: string;
  brandName: string;
  verificationCount: number;
}

interface ProductDistributionData {
  topProducts: ProductVerificationCount[];
  totalProducts: number; // This now likely represents products with verifications for the brand
}

const ProductDistribution = () => {
  const { user } = useAuth(); // Get user context if needed for conditional rendering or messages
  const [distributionData, setDistributionData] =
    useState<ProductDistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // --- Call the brand-specific backend endpoint ---
        // The backend will use the JWT to identify the user's brand
        const response = await apiClient.get<ProductDistributionData>(
          `/reporting/product-distribution`
        );
        setDistributionData(response.data);
        // -----------------------------------------------
        // For the 'any' type errors, add this above the line:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Failed to fetch product distribution:", err);
        // Provide user-friendly error messages
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError("Access denied. Please log in again.");
        } else if (err.response?.status === 404) {
          // This might happen if the endpoint returns 404 when no data is found for the brand
          setDistributionData({ topProducts: [], totalProducts: 0 }); // Set empty state
          setError(null); // Don't show error for "no data"
        } else {
          setError(
            "Failed to load product distribution data. Please try again later."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Fetch on component mount

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
  // Check for actual data existence after loading
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
            {/* Update text to reflect brand-specific data */}
            Total distinct products verified for your brand:{" "}
            <span className="font-semibold">
              {distributionData.totalProducts.toLocaleString()}
            </span>
            {/* If you have total products for the brand regardless of verification, you could show that too */}
            {/* Total products for your brand: <span className="font-semibold">{totalBrandProducts}</span> */}
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
                  {/* Customize tooltip to show full product name */}
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
              {/* Update message for no data specific to the brand */}
              No verification data found for your brand's products yet.
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
                  {/* Brand column might be redundant now, but kept for completeness if needed */}
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th> */}
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
                  // Calculate percentage share based on the top product's count
                  const maxCount =
                    distributionData.topProducts[0]?.verificationCount ?? 1; // Avoid division by 0
                  const percentage = (
                    (product.verificationCount / maxCount) *
                    100
                  ).toFixed(1);

                  return (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.productName}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.brandName}</td> */}
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
          // This case is less likely now due to the check above, but good to have
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No Verification Data
            </h3>
            <p className="mt-1 text-gray-500">
              No products for your brand have been verified yet.
            </p>
          </div>
        )}
        {/* ------------------------------------------------ */}
      </div>
    </ProtectedRoute>
  );
};

export default ProductDistribution;
