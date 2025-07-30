// components/SkeletonLoader.tsx
import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div> {/* Title */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>{" "}
        {/* Form element */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>{" "}
        {/* Form element */}
        <div className="h-10 bg-gray-200 rounded w-1/4"></div> {/* Button */}
      </div>
    </div>
  );
};

export default SkeletonLoader;
