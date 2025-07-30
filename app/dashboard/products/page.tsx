// pages/dashboard/products/index.tsx
"use client";
import React, { useState, useEffect } from "react";
import apiClient from "../../../lib/apiClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { Product } from "@/lib/types/product";
import { Brand } from "@/lib/types/brand"; // To potentially display brand info if needed
import { useAuth } from "@/context/AuthContext"; // Import useAuth to get user/brand info
import { useRouter } from "next/navigation";

const ProductList = () => {
  const router = useRouter();
  const { user } = useAuth(); // Get authenticated user info, which includes brandId
  const [products, setProducts] = useState<Product[]>([]);
  // Remove brands state as we are focusing on products of the user's brand
  // const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure user data (including brandId) is available
    if (!user?.brandId) {
      // If user is logged in but brandId is missing for some reason, show an error
      // This might happen briefly during auth loading or if there's a token issue
      if (user !== null) {
        // user is {} or null while loading, and an object when loaded
        setError(
          "Unable to determine your associated brand. Please contact support."
        );
        setLoading(false);
      }
      return; // Exit if user or brandId is not available yet
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // --- Fetch products for the authenticated user's brand ---
        // Use the brandId from the authenticated user context
        const productsResponse = await apiClient.get<Product[]>(
          `/products/by-brand/${user.brandId}`
        );
        setProducts(productsResponse.data);

        // --- Remove fetching all brands ---
        // The previous code fetched all brands here, which is no longer needed
        // for this specific view.
        // -------------------------------
      } catch (err: any) {
        console.error("Failed to fetch products for your brand:", err);
        // Differentiate error messages based on status if possible
        if (err.response?.status === 404) {
          setError("No products found for your brand.");
        } else if (
          err.response?.status === 403 ||
          err.response?.status === 401
        ) {
          // This might happen if the user's token is invalid or they don't have access
          setError("Access denied. Please log in again.");
          // Optionally trigger a logout or redirect
        } else {
          setError("Failed to load products. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.brandId, user]); // Re-run effect if user or user.brandId changes

  // Remove the getBrandName function as we are only dealing with the user's brand
  // const getBrandName = (brandId: string) => { ... }

  if (loading)
    return <div className="text-center py-10">Loading products...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <ProtectedRoute>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
          <Link
            href="/dashboard/products/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Product
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {products.map((product) => (
                <li key={product.id} className="hover:bg-gray-50">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="block px-6 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {product.description}
                          </p>
                        )}
                        {product.identifier && (
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {product.identifier}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* 
                          Remove the brand name display as all listed products belong to the user's brand.
                          If you still want to show the brand name for context, you could fetch the user's
                          brand details once and display it as a header or context, but it's not needed
                          per item. 
                        */}
                        {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {getBrandName(product.brandId)} 
                        </span> */}

                        {/* Add edit/view button if needed */}
                        {/* <button
                          onClick={(e) => { e.preventDefault(); router.push(`/dashboard/products/edit/${product.id}`); }}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Edit
                        </button> */}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No products found
            </h3>
            <p className="mt-1 text-gray-500">
              Get started by creating a new product for your brand.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/products/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Product
              </Link>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ProductList;
