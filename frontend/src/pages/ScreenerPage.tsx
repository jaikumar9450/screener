import React from 'react';

const ScreenerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Stock Screener</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Powerful stock screening tools coming soon! Filter stocks using 50+ fundamental and technical parameters.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fundamental Filters</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">P/E ratio, ROE, debt-to-equity, revenue growth, and more</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Technical Filters</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">RSI, moving averages, volume, price patterns</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pre-built Screens</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Value stocks, growth stocks, dividend stocks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenerPage;