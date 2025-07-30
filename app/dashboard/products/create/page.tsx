// pages/dashboard/products/create.tsx
"use client";
import React, { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types/product";
import { Brand } from "@/lib/types/brand";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

const CreateProduct = () => {
  const router = useRouter();
  const { user } = useAuth(); // Get authenticated user info
  const [userBrand, setUserBrand] = useState<Brand | null>(null); // State for the user's brand
  const [formData, setFormData] = useState<Omit<Product, "id" | "brandId">>({
    // Omit 'id' and 'brandId' as they are handled by backend/derived
    name: "",
    description: "",
    identifier: "", // E.g., SKU
    // brandId will be set from user context before submission
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(true); // Separate loading state for brand

  // Fetch the user's brand when the component mounts or user changes
  useEffect(() => {
    const fetchUserBrand = async () => {
      if (!user?.brandId) {
        // If user is not loaded or brandId is missing, wait or show error
        if (user !== null) {
          // user is {} or null while loading, and an object when loaded
          setError(
            "Unable to load your brand information. Please try again or contact support."
          );
        }
        setLoadingBrand(false);
        return;
      }

      try {
        setLoadingBrand(true);
        setError(null);
        // Fetch the specific brand associated with the user
        const response = await apiClient.get<Brand>(`/brands/my-brand`); // Use the new endpoint
        setUserBrand(response.data);
        // Optionally, you could pre-fill the form with brand context if needed in the future
        // For the 'any' type errors, add this above the line:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Failed to fetch user brand:", err);
        if (err.response?.status === 404) {
          setError("Your brand could not be found. Please contact support.");
        } else {
          setError("Failed to load your brand information. Please try again.");
        }
      } finally {
        setLoadingBrand(false);
      }
    };

    fetchUserBrand();
  }, [user?.brandId, user]); // Depend on user and user.brandId

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure we have the user's brand before submitting
    if (!userBrand) {
      setError("Cannot create product: Your brand information is missing.");
      return;
    }

    // Basic client-side validation can be added here if needed
    // if (!formData.name.trim()) {
    //   setError('Product name is required.');
    //   return;
    // }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare data to send, including the brandId from user context
      const productDataToSend: Omit<Product, "id"> = {
        ...formData,
        brandId: userBrand.id, // Associate product with the user's brand
      };

      const response = await apiClient.post<Product>(
        "/products",
        productDataToSend
      );
      console.log("Product created:", response.data);
      // Redirect to the product list or the newly created product's details page
      router.push("/dashboard/products");
      // For the 'any' type errors, add this above the line:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to create product:", err);
      // Provide user-friendly error messages based on status codes if possible
      const errorMsg =
        err.response?.data?.title ||
        err.response?.data?.message ||
        err.message ||
        "An error occurred while creating the product.";
      setError(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking for the user's brand
  if (loadingBrand) {
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
          <p className="mt-2 text-gray-600">
            Loading your brand information...
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error if fetching the brand failed
  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
                <button
                  onClick={() => router.refresh()} // Refresh the current route
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Retry
                </button>
                <button
                  onClick={() => router.push("/dashboard/products")}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Ensure userBrand is available before rendering the form
  if (!userBrand) {
    // This state should ideally be covered by the loading/error checks above
    // But added as a safeguard
    return (
      <ProtectedRoute>
        <div className="text-center py-10 text-gray-500">
          Unable to load brand information. Please contact support.
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Create New Product for {userBrand.name}
        </h1>

        {error && (
          <div className="mb-4 p-4 rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-lg p-6"
        >
          <div className="space-y-6">
            {/* Display the brand name instead of a dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 sm:text-sm">
                {userBrand.name}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                This product will be associated with your brand.
              </p>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Premium Shampoo"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description of the product..."
              />
            </div>

            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Identifier (SKU, GTIN, etc.)
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., SKU12345"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default CreateProduct;
