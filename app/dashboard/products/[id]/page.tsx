"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { Product } from "@/lib/types/product";
import { Brand } from "@/lib/types/brand";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string; // Get the product ID from params

  const [product, setProduct] = useState<Product | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure the ID is available
    if (!id || typeof id !== "string") {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch product details
        const productResponse = await apiClient.get<Product>(`/products/${id}`);
        const productData = productResponse.data;
        setProduct(productData);

        // 2. Fetch associated brand details
        if (productData.brandId) {
          const brandResponse = await apiClient.get<Brand>(
            `/brands/${productData.brandId}`
          );
          setBrand(brandResponse.data);
        }
        // For the 'any' type errors, add this above the line:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(`Failed to fetch product details for ID ${id}:`, err);
        if (err.response?.status === 404) {
          setError("Product not found.");
        } else {
          setError("Failed to load product details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading && !product) {
    return (
      <ProtectedRoute>
        <div className="text-center py-10">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading product details...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-red-500"
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
              <h3 className="mt-4 text-lg font-medium text-gray-900">Error</h3>
              <p className="mt-1 text-gray-500">{error}</p>
              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!product) {
    return (
      <ProtectedRoute>
        <div className="text-center py-10 text-gray-500">
          Product data could not be loaded.
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {product.name}
            </h1>
            {product.description && (
              <p className="mt-1 text-sm text-gray-500">
                {product.description}
              </p>
            )}
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to List
            </Link>
          </div>
        </div>

        {/* Product Details Card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Product Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details about this product.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {product.name}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {product.description || (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Identifier (SKU/GTIN)
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {product.identifier || (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Brand</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {brand ? (
                    <Link
                      href={`/brands/${brand.id}`}
                      className="text-indigo-600 hover:text-indigo-900 hover:underline"
                    >
                      {brand.name}
                    </Link>
                  ) : (
                    <span className="text-gray-400">Unknown Brand</span>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Product ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono text-xs">
                  {product.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Actions
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage this product or related data.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/dashboard/codes/generate"
                  className="block p-4 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center">
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
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zm0 10h2a1 1 0 001-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zM5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zm0 10h2a1 1 0 001-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zM9 4h.01M9 20h.01"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">
                        Generate Security Codes
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Create unique codes for this product.
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="p-4 border border-gray-200 rounded-lg shadow-sm opacity-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 p-3 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
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
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">
                        View Verification Stats
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        See reports specific to this product. (Coming Soon)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
