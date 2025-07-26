import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Join StockFilter Pro and start your investment journey
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <p className="text-center text-gray-600 dark:text-gray-300">
            Registration form coming soon...
          </p>
          
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;