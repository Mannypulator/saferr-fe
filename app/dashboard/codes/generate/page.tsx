// pages/dashboard/codes/generate.tsx
"use client";
import React, { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// Define basic types (assuming these exist or are imported)
interface Brand {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  brandId: string;
}

const CodeGeneration: React.FC<{ searchParams: { productId?: string } }> = ({
  searchParams,
}) => {
  const router = useRouter();
  const queryProductId = searchParams.productId;
  const { user } = useAuth();

  const [userBrand, setUserBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [codeCount, setCodeCount] = useState<number>(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [loadingBrandProducts, setLoadingBrandProducts] = useState(true);

  useEffect(() => {
    const fetchBrandAndProducts = async () => {
      if (!user?.brandId) {
        if (user !== null) {
          setMessage({
            type: "error",
            text: "Unable to load your brand information. Please try again or contact support.",
          });
        }
        setLoadingBrandProducts(false);
        return;
      }

      try {
        setLoadingBrandProducts(true);
        setMessage(null);

        const brandResponse = await apiClient.get<Brand>("/brands/my-brand");
        setUserBrand(brandResponse.data);

        const productsResponse = await apiClient.get<Product[]>(
          `/products/by-brand/${user.brandId}`
        );
        setProducts(productsResponse.data);

        const productIdString = Array.isArray(queryProductId)
          ? queryProductId[0]
          : queryProductId;
        if (productIdString) {
          const productExists = productsResponse.data.some(
            (p) => p.id === productIdString
          );
          if (productExists) {
            setSelectedProductId(productIdString);
            setMessage({
              type: "info",
              text: `Pre-selected product based on link.`,
            });
          } else {
            console.warn(
              `Pre-selected product ID ${productIdString} not found.`
            );
            setMessage({
              type: "error",
              text: "The specified product was not found.",
            });
          }
        } else {
          if (productsResponse.data.length > 0 && !selectedProductId) {
            setSelectedProductId(productsResponse.data[0].id);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch brand or products:", err);
        if (err.response?.status === 404) {
          setMessage({
            type: "error",
            text: "Your brand or its products could not be found.",
          });
        } else {
          setMessage({
            type: "error",
            text: "Failed to load your brand or products. Please try again.",
          });
        }
      } finally {
        setLoadingBrandProducts(false);
      }
    };

    fetchBrandAndProducts();
  }, [user?.brandId, user, queryProductId]);

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setMessage({ type: "error", text: "Please select a product." });
      return;
    }
    if (codeCount <= 0) {
      setMessage({
        type: "error",
        text: "Code count must be greater than zero.",
      });
      return;
    }
    if (codeCount > 10000) {
      setMessage({
        type: "error",
        text: "Maximum code count is 10,000 per request.",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedCodes([]);
    setMessage({ type: "info", text: `Generating ${codeCount} codes...` });
    try {
      const response = await apiClient.post<{ generatedCodes: string[] }>(
        `/securitycodes/generate/${selectedProductId}?count=${codeCount}`
      );
      setGeneratedCodes(response.data.generatedCodes);
      setMessage({
        type: "success",
        text: `Successfully generated ${response.data.generatedCodes.length} codes.`,
      });
    } catch (err: any) {
      console.error("Failed to generate codes:", err);
      const errorMsg =
        err.response?.data?.title ||
        err.response?.data?.message ||
        err.message ||
        "An error occurred during code generation.";
      setMessage({ type: "error", text: `Error: ${errorMsg}` });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Export Functions ---
  const exportAsCsv = () => {
    if (generatedCodes.length === 0) {
      setMessage({ type: "error", text: "No codes to export." });
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," + "Code\n" + generatedCodes.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `saferr_codes_${new Date()
        .toISOString()
        .slice(0, 10)}_${selectedProductId.substring(0, 8)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage({
      type: "success",
      text: "Codes exported as CSV successfully!",
    });
  };

  const copyAllCodes = () => {
    if (generatedCodes.length === 0) {
      setMessage({ type: "error", text: "No codes to copy." });
      return;
    }
    navigator.clipboard.writeText(generatedCodes.join("\n"));
    setMessage({ type: "success", text: "Codes copied to clipboard!" });
  };

  const downloadAsText = () => {
    if (generatedCodes.length === 0) {
      setMessage({ type: "error", text: "No codes to download." });
      return;
    }
    const blob = new Blob([generatedCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saferr_codes_${new Date()
      .toISOString()
      .slice(0, 10)}_${selectedProductId.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({
      type: "success",
      text: "Codes downloaded as text file successfully!",
    });
  };
  // -----------------------

  if (loadingBrandProducts) {
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
            Loading your brand and products...
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  if (message?.type === "error" && message.text.includes("brand")) {
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
              <p className="mt-1 text-gray-500">{message.text}</p>
              <div className="mt-6">
                <button
                  onClick={() => router.refresh()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Retry
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!userBrand) {
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
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Generate Security Codes
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              For brand: {userBrand.name}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/dashboard/products"
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Manage Products
            </Link>
          </div>
        </div>

        {/* --- Enhanced Message Display --- */}
        {message && (
          <div
            className={`mb-4 p-4 rounded flex items-start ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {message.type === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : message.type === "error" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        )}
        {/* -------------------------- */}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Code Generation Form
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Select a product and specify the number of codes to generate.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <form onSubmit={handleGenerateCodes} className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="product"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="product"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Choose a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {products.length === 0 && (
                    <p className="mt-1 text-sm text-yellow-600">
                      No products found.{" "}
                      <Link
                        href="/dashboard/products/create"
                        className="font-medium underline"
                      >
                        Create one now
                      </Link>
                      .
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="count"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of Codes <span className="text-red-500">*</span> (Max
                    10,000)
                  </label>
                  <input
                    type="number"
                    id="count"
                    min="1"
                    max="10000"
                    value={codeCount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 1 && val <= 10000) {
                        setCodeCount(val);
                      } else if (val > 10000) {
                        setCodeCount(10000);
                      } else if (val < 1) {
                        setCodeCount(1);
                      }
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the number of unique codes to generate.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={
                    isGenerating || !selectedProductId || products.length === 0
                  }
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    isGenerating || !selectedProductId || products.length === 0
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  {isGenerating ? (
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
                      Generating...
                    </>
                  ) : (
                    "Generate Codes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {generatedCodes.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    Generated Codes
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    <span className="font-medium">{generatedCodes.length}</span>{" "}
                    codes generated successfully.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
                  <button
                    onClick={copyAllCodes}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="-ml-1 mr-1 h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy All
                  </button>
                  <button
                    onClick={downloadAsText}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="-ml-1 mr-1 h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download TXT
                  </button>
                  {/* --- NEW: Export as CSV Button --- */}
                  <button
                    onClick={exportAsCsv}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="-ml-1 mr-1 h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Export CSV
                  </button>
                  {/* ------------------------------ */}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Code
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedCodes.map((code, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {code}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default CodeGeneration;
