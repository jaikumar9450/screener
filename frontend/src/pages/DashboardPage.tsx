import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  // Mock data for demonstration
  const portfolioStats = {
    totalValue: 545000,
    totalInvestment: 450000,
    totalPnL: 95000,
    totalPnLPercent: 21.11,
    dayChange: -2500,
    dayChangePercent: -0.46,
  };

  const quickStats = [
    {
      name: 'Total Portfolio Value',
      value: `₹${portfolioStats.totalValue.toLocaleString()}`,
      change: `₹${portfolioStats.dayChange.toLocaleString()}`,
      changePercent: `${portfolioStats.dayChangePercent}%`,
      positive: portfolioStats.dayChange >= 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      name: 'Total P&L',
      value: `₹${portfolioStats.totalPnL.toLocaleString()}`,
      change: `${portfolioStats.totalPnLPercent}%`,
      changePercent: 'All time',
      positive: portfolioStats.totalPnL >= 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      name: 'Active Positions',
      value: '12',
      change: '+2',
      changePercent: 'This month',
      positive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Watchlist Alerts',
      value: '5',
      change: 'Active',
      changePercent: 'Real-time',
      positive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  const topHoldings = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', qty: 50, price: 2650, change: 2.5, value: 132500 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', qty: 25, price: 3800, change: -1.2, value: 95000 },
    { symbol: 'INFY', name: 'Infosys Limited', qty: 40, price: 1650, change: 0.8, value: 66000 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', qty: 30, price: 1580, change: -0.5, value: 47400 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', qty: 45, price: 1020, change: 1.8, value: 45900 },
  ];

  const marketMovers = [
    { symbol: 'ADANIPORTS', name: 'Adani Ports', price: 785, change: 5.2 },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6850, change: -2.8 },
    { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 10200, change: 3.1 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1180, change: -1.5 },
  ];

  const quickActions = [
    {
      name: 'Run Stock Screener',
      description: 'Find investment opportunities',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: '/screener',
      color: 'bg-brand-500 hover:bg-brand-600',
    },
    {
      name: 'Add Transaction',
      description: 'Record buy/sell transactions',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      href: '/portfolio',
      color: 'bg-success-500 hover:bg-success-600',
    },
    {
      name: 'View Watchlist',
      description: 'Monitor your stocks',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      href: '/watchlist',
      color: 'bg-warning-500 hover:bg-warning-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-brand-100 dark:text-brand-200">
              Here's your portfolio overview for today, {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="text-right">
              <p className="text-sm text-brand-100 dark:text-brand-200">Market Status</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Open</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.positive ? 'bg-success-100 dark:bg-success-900' : 'bg-error-100 dark:bg-error-900'}`}>
                <div className={`${stat.positive ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`text-sm font-medium ${stat.positive ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.changePercent}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Holdings */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Holdings</h2>
                <Link
                  to="/portfolio"
                  className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topHoldings.map((holding, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {holding.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{holding.symbol}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-32">
                          {holding.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₹{holding.value.toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {holding.qty} × ₹{holding.price}
                        </span>
                        <span className={`text-sm font-medium ${
                          holding.change >= 0 
                            ? 'text-success-600 dark:text-success-400' 
                            : 'text-error-600 dark:text-error-400'
                        }`}>
                          {holding.change >= 0 ? '+' : ''}{holding.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className={`block p-4 rounded-lg ${action.color} text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
                >
                  <div className="flex items-center space-x-3">
                    {action.icon}
                    <div>
                      <p className="font-medium">{action.name}</p>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Market Movers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Market Movers</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {marketMovers.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{stock.symbol}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-24">
                        {stock.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{stock.price.toLocaleString()}
                      </p>
                      <p className={`text-sm font-medium ${
                        stock.change >= 0 
                          ? 'text-success-600 dark:text-success-400' 
                          : 'text-error-600 dark:text-error-400'
                      }`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { type: 'buy', stock: 'RELIANCE', qty: 10, price: 2640, time: '2 hours ago' },
              { type: 'sell', stock: 'TCS', qty: 5, price: 3820, time: '1 day ago' },
              { type: 'alert', stock: 'INFY', message: 'Price alert triggered', time: '2 days ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                <div className={`p-2 rounded-full ${
                  activity.type === 'buy' 
                    ? 'bg-success-100 dark:bg-success-900 text-success-600 dark:text-success-400'
                    : activity.type === 'sell'
                    ? 'bg-error-100 dark:bg-error-900 text-error-600 dark:text-error-400'
                    : 'bg-warning-100 dark:bg-warning-900 text-warning-600 dark:text-warning-400'
                }`}>
                  {activity.type === 'buy' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ) : activity.type === 'sell' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.type === 'buy' 
                      ? `Bought ${activity.qty} shares of ${activity.stock}`
                      : activity.type === 'sell'
                      ? `Sold ${activity.qty} shares of ${activity.stock}`
                      : `${activity.stock}: ${activity.message}`
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.price && `₹${activity.price} per share • `}{activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;