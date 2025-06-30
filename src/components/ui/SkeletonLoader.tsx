import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'image' | 'card' | 'weaving';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  variant = 'text' 
}) => {
  if (variant === 'weaving') {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-plum-100 via-rosegold-100 to-plum-100 animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-8 bg-plum-400 rounded-full animate-weave"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
          <p className="ml-4 text-plum-600 font-medium">Weaving your design...</p>
        </div>
      </div>
    );
  }

  if (variant === 'image') {
    return (
      <div className={`bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-lg ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-plum-200 border-t-plum-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-2xl p-6 animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded ${className}`}>
      <div className="h-4 bg-transparent"></div>
    </div>
  );
};

export default SkeletonLoader;