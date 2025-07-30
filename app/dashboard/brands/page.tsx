// app/(dashboard)/brands/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // Adjust import path
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient"; // Adjust import path
import ProtectedRoute from "@/components/ProtectedRoute"; // Adjust import path
import Link from "next/link";
import { Brand } from "@/lib/types/brand"; // Adjust import path
import { SubscriptionPlan, BrandSubscription } from "@/lib/types/subscription"; // Adjust import path

// Define simplified types for subscription data based on backend (Free plan focus)
// These should ideally match your backend DTOs or be imported from a shared types file.

// interface SubscriptionPlan {
//   id: string;
//   name: string;
//   // ... other plan properties relevant for display
//   maxCodesPerMonth: number; // Example property for Free plan message
// }

// interface BrandSubscription {
//   id: string;
//   subscriptionPlan: SubscriptionPlan;
//   startDate: string; // ISO string
//   endDate: string | null; // ISO string or null
//   status: string; // e.g., "Active", "Expired"
//   // ... other subscription properties
// }

export default function BrandListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null); // Single brand state
  const [currentSubscription, setCurrentSubscription] =
    useState<BrandSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.brandId) {
        // Wait for user data or handle missing brandId
        if (user !== null) {
          setError(
            "Unable to load your brand information. Please log in again."
          );
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch the single brand associated with the user
        // Fetch the current subscription for that brand
        // Use Promise.allSettled to handle potential individual errors gracefully
        const [brandResponse, subscriptionResponse] = await Promise.allSettled([
          apiClient.get<Brand>(`/brands/my-brand`), // Get the user's specific brand
          apiClient.get<BrandSubscription>(
            `/subscriptions/current/${user.brandId}`
          ),
        ]);

        // Handle Brand Response
        if (brandResponse.status === "fulfilled") {
          setBrand(brandResponse.value.data);
        } else {
          console.error("Failed to fetch brand:", brandResponse.reason);
          if (brandResponse.reason?.response?.status === 404) {
            setError("Your brand could not be found. Please contact support.");
          } else if (
            brandResponse.reason?.response?.status === 403 ||
            brandResponse.reason?.response?.status === 401
          ) {
            setError("Access denied for brand data. Please log in again.");
          } else {
            setError("Failed to load your brand information.");
          }
        }

        // Handle Subscription Response
        if (subscriptionResponse.status === "fulfilled") {
          setCurrentSubscription(subscriptionResponse.value.data);
        } else {
          console.warn(
            "Failed to fetch subscription:",
            subscriptionResponse.reason
          );
          // It's okay if subscription data is not found or fails initially.
          // The UI can handle a null currentSubscription state.
          // Log it for debugging.
          if (subscriptionResponse.reason?.response?.status === 404) {
            console.log("No active subscription found for the brand.");
            // Optionally, you could set a default "Free" subscription state here
            // if your backend doesn't automatically assign one, but it's better
            // to rely on the backend providing it or handle the null state in UI.
          } else {
            console.error(
              "Error fetching subscription:",
              subscriptionResponse.reason
            );
          }
          // Don't set a page-level error just because subscription failed,
          // unless the brand fetch also failed.
        }
      } catch (err: any) {
        console.error("Unexpected error during data fetching:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.brandId, user]); // Depend on user object as well to trigger on auth load

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>{" "}
              {/* Smaller button placeholder */}
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>{" "}
                {/* Overview title */}
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>{" "}
                {/* Plan info line 1 */}
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>{" "}
                {/* Plan info line 2 */}
              </div>
            </div>
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>{" "}
                {/* Brand Info title */}
                {[...Array(4)].map(
                  (
                    _,
                    i // Fewer lines for brand details
                  ) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-10">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // If data loaded but brand is somehow still null/undefined (should be caught by error/loading)
  // This is a safeguard.
  if (!brand) {
    return (
      <ProtectedRoute>
        <div className="text-center py-10 text-gray-500">
          Brand data could not be loaded. Please contact support.
        </div>
      </ProtectedRoute>
    );
  }

  // --- Helper functions for subscription display (simplified for one brand) ---
  const isFreePlan = () => {
    return (
      currentSubscription?.subscriptionPlan?.name?.toLowerCase() === "free"
    );
  };

  // Example usage info based on subscription (adapt based on your plan properties)
  const getPlanLimitInfo = () => {
    if (isFreePlan() && currentSubscription?.subscriptionPlan) {
      const plan = currentSubscription.subscriptionPlan;
      return `Limit: ${
        plan.maxCodesPerMonth?.toLocaleString() || "N/A"
      } codes per product/month.`;
    }
    // Add logic for other plans if needed in the future
    return null;
  };
  // -------------------------------------------------------------------------

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Manage Your Brand
            </h1>
            <p className="mt-1 text-sm text-gray-500">{brand.name}</p>
          </div>
          {/* Actions for the single brand */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/brands/${brand.id}`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Details
            </Link>
            <Link
              href={`/dashboard/products?brandId=${brand.id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Manage Products
            </Link>
            {/* Placeholder for future actions like "View Analytics" if subscription allows */}
            {/* {currentSubscription && !isFreePlan() && (
              <Link
                href={`/brands/${brand.id}/analytics`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Analytics
              </Link>
            )} */}
          </div>
        </div>

        {/* Subscription Info Banner */}
        {currentSubscription ? (
          <div
            className={`border-l-4 p-4 mb-6 rounded-lg ${
              isFreePlan()
                ? "bg-blue-50 border-blue-400"
                : "bg-green-50 border-green-400"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className={`h-5 w-5 ${
                    isFreePlan() ? "text-blue-400" : "text-green-400"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm ${
                    isFreePlan() ? "text-blue-700" : "text-green-700"
                  }`}
                >
                  <span className="font-medium">Current Plan:</span>{" "}
                  {currentSubscription.subscriptionPlan?.name}
                  {/* Example: Show upgrade option for Free plan */}
                  {isFreePlan() && (
                    <>
                      {" "}
                      (
                      <Link
                        href="/dashboard/subscriptions/plans"
                        className="underline hover:opacity-80"
                      >
                        Upgrade
                      </Link>
                      )
                    </>
                  )}
                </p>
                {/* Example: Show plan limits for Free plan */}
                {isFreePlan() && (
                  <p className="text-xs opacity-80 mt-1">
                    {getPlanLimitInfo()}
                  </p>
                )}
                {/* Example: Show subscription status */}
                <p className="text-xs opacity-80 mt-1">
                  Status:{" "}
                  <span className="capitalize">
                    {currentSubscription.status}
                  </span>
                  {currentSubscription.endDate && (
                    <>
                      {" "}
                      &bull; Valid until{" "}
                      {new Date(
                        currentSubscription.endDate
                      ).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Handle case where subscription data failed to load but brand exists
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Subscription information is currently unavailable. Some
                  features might be limited.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Brand Details Card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Brand Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details and contact information for {brand.name}.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {brand.name}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {brand.description || (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Contact Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {brand.contactEmail ? (
                    <a
                      href={`mailto:${brand.contactEmail}`}
                      className="text-indigo-600 hover:text-indigo-900 hover:underline"
                    >
                      {brand.contactEmail}
                    </a>
                  ) : (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Contact Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {brand.contactPhone || (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your brand and its products efficiently.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href={`/dashboard/products`}
                  className="block p-4 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-base font-medium text-gray-900">
                        Manage Products
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">
                        View and edit your products.
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href={`/dashboard/codes/generate`}
                  className="block p-4 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex-shrink-0 bg-green-100 p-3 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zm0 10h2a1 1 0 001-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zM5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zm0 10h2a1 1 0 001-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zM9 4h.01M9 20h.01"
                        />
                      </svg>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-base font-medium text-gray-900">
                        Generate Codes
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">
                        Create security codes for products.
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href={`/dashboard/reports`} // Adjust path if reports are brand-specific sub-pages
                  className="block p-4 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex-shrink-0 bg-purple-100 p-3 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-base font-medium text-gray-900">
                        View Reports
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">
                        See verification trends and insights.
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Placeholder for future actions based on subscription */}
                {/* {currentSubscription && !isFreePlan() ? (
                  <Link
                    href={`/brands/${brand.id}/advanced-settings`}
                    className="block p-4 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-base font-medium text-gray-900">Advanced Settings</h4>
                        <p className="mt-1 text-xs text-gray-500">Configure custom options.</p>
                      </div>
                    </div>
                  </Link>
                ) : ( */}
                <div className="block p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 text-center opacity-70">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex-shrink-0 bg-gray-200 p-3 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-base font-medium text-gray-700">
                        More Features
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">
                        Available in paid plans.
                      </p>
                      {isFreePlan() && currentSubscription && (
                        <Link
                          href="/dashboard/subscriptions/plans"
                          className="mt-2 inline-block text-xs text-indigo-600 hover:underline"
                        >
                          Upgrade Plan
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                {/* )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
