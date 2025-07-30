// app/(dashboard)/brands/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { Brand } from "@/lib/types/brand";
import { Product } from "@/lib/types/product";
import EnhancedTable from "@/components/EnhancedTable";

export default function BrandDetailsPage() {
  const params = useParams();
  const id = params.id as string; // Get the brand ID from params

  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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

        // 1. Fetch brand details
        const brandResponse = await apiClient.get<Brand>(`/brands/${id}`);
        setBrand(brandResponse.data);

        // 2. Fetch products for this brand
        const productsResponse = await apiClient.get<Product[]>(
          `/products/by-brand/${id}`
        );
        setProducts(productsResponse.data);
      } catch (err: any) {
        console.error(
          `Failed to fetch brand details or products for ID ${id}:`,
          err
        );
        if (err.response?.status === 404) {
          setError("Brand not found.");
        } else {
          setError("Failed to load brand details or associated products.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading && !brand) {
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
          <p className="mt-2 text-gray-600">Loading brand details...</p>
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
                  href="/dashboard/brands"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Brands
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!brand) {
    return (
      <ProtectedRoute>
        <div className="text-center py-10 text-gray-500">
          Brand data could not be loaded.
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
              {brand.name}
            </h1>
            {brand.description && (
              <p className="mt-1 text-sm text-gray-500">{brand.description}</p>
            )}
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Link
              href="/dashboard/brands"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to List
            </Link>
          </div>
        </div>

        {/* Brand Details Card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Brand Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details and contact information.
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
                      className="text-indigo-600 hover:text-indigo-900"
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

        {/* Products Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Associated Products
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Products registered under this brand.
                </p>
              </div>
              {/* Add Product button could go here */}
            </div>
          </div>
          <div className="border-t border-gray-200">
            {products.length > 0 ? (
              <EnhancedTable
                data={products}
                columns={[
                  { accessor: "name", header: "Product Name" },
                  { accessor: (item) => item.identifier || '-', header: "SKU" },
                  { accessor: (item) => item.description || '-', header: "Category" },
                ]}
              />
            ) : (
              <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                No products found for this brand.
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
