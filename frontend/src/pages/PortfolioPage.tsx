import React from 'react';

const PortfolioPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Portfolio Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced portfolio tracking and analytics coming soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;