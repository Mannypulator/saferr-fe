// components/Navbar.tsx
"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

const Navbar: React.FC = () => {
  const { user, logout } = useAuth(); // Get user and logout function

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="ml-2 text-xl font-bold text-indigo-600">
                SAFERR
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user && ( // Only show dashboard link if logged in
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? ( // Show user menu if logged in
              <div className="ml-3 relative">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 hidden md:inline">
                    {user.username}
                  </span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {user.brandName}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              // Show login link if not logged in
              <Link
                href="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
