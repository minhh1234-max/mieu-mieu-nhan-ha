import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Footer = () => {
  const { isAdmin } = useAuth();

  return (
    <footer className="bg-white dark:bg-[#0d0d0d] border-t border-gray-100 dark:border-gray-800 py-12 transition-colors duration-500 ease-in-out">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center">
          <img 
            src="https://ais-pre-y6dtd4eoyapq7qzf35xbqm-66651900258.asia-east1.run.app/api/attachments/66651900258/66651900258_1.png" 
            alt="Miêu Miêu Nhàn Hạ" 
            className="h-16 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {isAdmin && (
          <div className="mt-8">
            <Link to="/admin-login" className="text-xs text-gray-400 dark:text-gray-600 hover:text-emerald-600 transition-colors">Admin Login</Link>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
