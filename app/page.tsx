// pages/index.tsx (Enhanced parts)
import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        <h1 className="text-5xl font-bold text-indigo-800 mb-4">
          Welcome to <span className="text-blue-600">SAFERR</span>
        </h1>
        <p className="mt-3 text-2xl text-gray-700 max-w-2xl">
          Protect your brand and empower consumers with our simple, secure
          product authentication system.
        </p>

        {/* --- Enhanced Consumer Guidance Section --- */}
        <div className="mt-10 bg-white rounded-xl shadow-md p-6 max-w-4xl w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            For Consumers: Verify Product Authenticity
          </h2>
          <p className="text-gray-600 mb-4">
            Want to know if a product is genuine? It's simple:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-left text-gray-700 max-w-md mx-auto">
            <li>Find the unique SAFERR code on the product packaging.</li>
            <li>
              Send the code via SMS to{" "}
              <span className="font-semibold text-indigo-600">
                +1 (800) SAFERR-1
              </span>{" "}
              (toll-free).
            </li>
            <li>
              Receive an instant reply confirming if the product is genuine or
              counterfeit.
            </li>
          </ol>
          <div className="mt-6 flex justify-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-64 h-32 flex items-center justify-center text-gray-500">
              Example Product Packaging with Code
            </div>
          </div>
        </div>
        {/* ------------------------------------------- */}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3 font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Brand Owner Login
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Unique Codes
            </h3>
            <p className="text-gray-600">
              Generate trillions of unique codes for your products.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              SMS Verification
            </h3>
            <p className="text-gray-600">
              Consumers verify easily via toll-free SMS.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Insightful Reports
            </h3>
            <p className="text-gray-600">
              Track verification trends and suspicious activity.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full h-20 border-t border-gray-200 flex items-center justify-center">
        <p className="text-gray-600">
          © {new Date().getFullYear()} SAFERR. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
